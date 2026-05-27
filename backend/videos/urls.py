from django.urls import path

from .views import VideoDetailView, VideoListCreateView, react_video, stream_video

urlpatterns = [
    path("", VideoListCreateView.as_view(), name="video-list"),
    path("<int:pk>/", VideoDetailView.as_view(), name="video-detail"),
    path("<int:pk>/stream/", stream_video, name="video-stream"),
    path("<int:pk>/react/", react_video, name="video-react"),
]