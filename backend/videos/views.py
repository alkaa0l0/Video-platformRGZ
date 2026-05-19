import os
import re

from django.http import FileResponse, Http404, HttpResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Video
from .serializers import VideoSerializer


CHUNK_SIZE = 8192 * 1024  # 8 МБ — комфортный размер чанка для потокового видео


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Изменять видео может только владелец."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id


class VideoListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/videos/         — список видео (доступно всем)
    POST /api/videos/         — загрузка нового видео (только авторизованные)
    """
    serializer_class = VideoSerializer
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Video.objects.select_related("owner").all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/videos/<id>/"""
    serializer_class = VideoSerializer
    queryset = Video.objects.select_related("owner").all()
    permission_classes = (IsOwnerOrReadOnly,)


def _range_response(file_path: str, range_header: str, content_type: str):
    """Отдаёт фрагмент файла согласно HTTP Range — для нормальной перемотки."""
    size = os.path.getsize(file_path)
    match = re.match(r"bytes=(\d+)-(\d*)", range_header)
    if not match:
        return None

    start = int(match.group(1))
    end_raw = match.group(2)
    end = int(end_raw) if end_raw else min(start + CHUNK_SIZE, size - 1)
    end = min(end, size - 1)
    length = end - start + 1

    def chunk_iter():
        with open(file_path, "rb") as f:
            f.seek(start)
            remaining = length
            while remaining > 0:
                read_size = min(8192, remaining)
                data = f.read(read_size)
                if not data:
                    break
                yield data
                remaining -= len(data)

    response = StreamingHttpResponse(
        chunk_iter(), status=status.HTTP_206_PARTIAL_CONTENT, content_type=content_type
    )
    response["Content-Length"] = str(length)
    response["Accept-Ranges"] = "bytes"
    response["Content-Range"] = f"bytes {start}-{end}/{size}"
    return response


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def stream_video(request, pk: int):
    """
    GET /api/videos/<id>/stream/
    Потоковая отдача видео с поддержкой HTTP Range для перемотки.
    """
    video = get_object_or_404(Video, pk=pk)
    if not video.file:
        raise Http404("Файл не найден")

    Video.objects.filter(pk=video.pk).update(views=video.views + 1)

    file_path = video.file.path
    content_type = "video/mp4"
    range_header = request.META.get("HTTP_RANGE", "")

    if range_header:
        resp = _range_response(file_path, range_header, content_type)
        if resp is not None:
            return resp

    # Полный файл, если Range не передан
    response = FileResponse(open(file_path, "rb"), content_type=content_type)
    response["Accept-Ranges"] = "bytes"
    response["Content-Length"] = str(os.path.getsize(file_path))
    return response
