from django.urls import path

from .views import MessageListCreateView, ToggleLikeView

urlpatterns = [
    path("", MessageListCreateView.as_view(), name="message-list"),
    path("<int:pk>/like/", ToggleLikeView.as_view(), name="message-like"),
]
