from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Like, Message
from .serializers import MessageSerializer


class MessageListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/chat/?video=<id>&kind=chat|question
    POST /api/chat/   — отправка нового сообщения
    """
    serializer_class = MessageSerializer

    def get_queryset(self):
        qs = (
            Message.objects.select_related("author")
            .annotate(likes_count=Count("likes"))
        )
        video_id = self.request.query_params.get("video")
        if video_id:
            qs = qs.filter(video_id=video_id)
        kind = self.request.query_params.get("kind")
        if kind:
            qs = qs.filter(kind=kind)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class ToggleLikeView(APIView):
    """POST /api/chat/<id>/like/ — поставить или снять лайк."""

    def post(self, request, pk: int):
        message = get_object_or_404(Message, pk=pk)
        like, created = Like.objects.get_or_create(message=message, user=request.user)
        if not created:
            like.delete()
            liked = False
        else:
            liked = True
        return Response(
            {"liked": liked, "likes_count": message.likes.count()},
            status=status.HTTP_200_OK,
        )
