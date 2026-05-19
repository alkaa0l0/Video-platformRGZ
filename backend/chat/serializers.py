from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    liked_by_me = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            "id",
            "video",
            "author_name",
            "text",
            "kind",
            "likes_count",
            "liked_by_me",
            "created_at",
        )
        read_only_fields = ("id", "author_name", "likes_count", "liked_by_me", "created_at")

    def get_author_name(self, obj) -> str:
        # «Имя в чате» приоритетнее имени из профиля
        return obj.author.chat_name or obj.author.first_name or obj.author.email.split("@")[0]

    def get_liked_by_me(self, obj) -> bool:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.likes.filter(user=request.user).exists()
