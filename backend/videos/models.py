from django.conf import settings
from django.db import models


class Video(models.Model):
    """Модель загруженного видео."""
    title = models.CharField("Название", max_length=200)
    description = models.TextField("Описание", blank=True)
    file = models.FileField("Файл видео", upload_to="videos/")
    poster = models.ImageField("Постер", upload_to="posters/", blank=True, null=True)
    duration = models.PositiveIntegerField("Длительность, сек", default=0)
    views = models.PositiveIntegerField("Просмотры", default=0)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="videos",
        verbose_name="Автор",
    )
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        verbose_name = "Видео"
        verbose_name_plural = "Видео"

    def __str__(self) -> str:
        return self.title


class VideoReaction(models.Model):
    """
    Лайк или дизлайк видео.
    Один пользователь может оставить только одну реакцию на видео
    (ограничение unique_together).
    """
    LIKE = "like"
    DISLIKE = "dislike"
    VALUE_CHOICES = [(LIKE, "Лайк"), (DISLIKE, "Дизлайк")]

    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="reactions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )
    value = models.CharField(max_length=8, choices=VALUE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("video", "user")
        verbose_name = "Реакция на видео"
        verbose_name_plural = "Реакции на видео"

    def __str__(self) -> str:
        return f"{self.user} -> {self.video}: {self.value}"