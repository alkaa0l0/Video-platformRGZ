from django.conf import settings
from django.db import models

from videos.models import Video


class MessageKind(models.TextChoices):
    CHAT = "chat", "Чат"
    QUESTION = "question", "Вопрос / ответ"


class Message(models.Model):
    """
    Сообщение в чате или раздел «Вопрос / ответ» (см. вкладки на дизайне).
    Поле likes_count считается на стороне БД, отдельная таблица лайков —
    в Like, чтобы избежать повторных лайков от одного пользователя.
    """
    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="messages"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages"
    )
    text = models.TextField("Текст сообщения")
    kind = models.CharField(
        "Тип", max_length=16, choices=MessageKind.choices, default=MessageKind.CHAT
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)
        verbose_name = "Сообщение"
        verbose_name_plural = "Сообщения"

    def __str__(self) -> str:
        return f"{self.author.email}: {self.text[:40]}"


class Like(models.Model):
    """Лайк сообщения — иконка-сердечко из дизайна."""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("message", "user")
