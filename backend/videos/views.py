import os
import re

from django.http import FileResponse, Http404, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Video, VideoReaction
from .serializers import VideoSerializer

CHUNK_SIZE = 8192 * 1024  # 8 МБ — размер чанка для потокового видео


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Изменять видео может только владелец."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner_id == request.user.id


class VideoListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/videos/   — список видео (доступно всем)
    POST /api/videos/   — загрузка видео (только авторизованные)
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


def _range_response(file_path, range_header, content_type):
    """Отдаёт фрагмент файла согласно HTTP Range — для перемотки."""
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
                data = f.read(min(8192, remaining))
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
def stream_video(request, pk):
    """GET /api/videos/<id>/stream/ — потоковая отдача с поддержкой Range."""
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

    response = FileResponse(open(file_path, "rb"), content_type=content_type)
    response["Accept-Ranges"] = "bytes"
    response["Content-Length"] = str(os.path.getsize(file_path))
    return response


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def react_video(request, pk):
    """
    POST /api/videos/<id>/react/ — лайк или дизлайк.
    Тело запроса: {"value": "like"} или {"value": "dislike"}.
    Повторное нажатие той же реакции снимает её.
    """
    video = get_object_or_404(Video, pk=pk)
    value = request.data.get("value")

    if value not in (VideoReaction.LIKE, VideoReaction.DISLIKE):
        return Response(
            {"detail": "value должно быть 'like' или 'dislike'"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reaction = VideoReaction.objects.filter(video=video, user=request.user).first()

    if reaction is None:
        VideoReaction.objects.create(video=video, user=request.user, value=value)
        my = value
    elif reaction.value == value:
        reaction.delete()          # повторное нажатие — снять реакцию
        my = None
    else:
        reaction.value = value     # переключить лайк <-> дизлайк
        reaction.save(update_fields=["value"])
        my = value

    return Response({
        "my_reaction": my,
        "likes": video.reactions.filter(value="like").count(),
        "dislikes": video.reactions.filter(value="dislike").count(),
    })