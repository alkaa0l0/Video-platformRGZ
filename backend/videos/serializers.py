from rest_framework import serializers

from .models import Video


class VideoSerializer(serializers.ModelSerializer):
    owner_email = serializers.ReadOnlyField(source="owner.email")
    file_url = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = (
            "id",
            "title",
            "description",
            "file",
            "file_url",
            "poster",
            "poster_url",
            "duration",
            "views",
            "owner_email",
            "created_at",
        )
        read_only_fields = ("id", "views", "owner_email", "created_at", "file_url", "poster_url")
        extra_kwargs = {
            "file": {"write_only": True},
            "poster": {"write_only": True, "required": False},
        }

    def _abs(self, request, field):
        if not field:
            return None
        url = field.url
        return request.build_absolute_uri(url) if request else url

    def get_file_url(self, obj):
        request = self.context.get("request")
        return self._abs(request, obj.file)

    def get_poster_url(self, obj):
        request = self.context.get("request")
        return self._abs(request, obj.poster)
