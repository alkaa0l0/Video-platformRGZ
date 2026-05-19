from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "owner", "views", "created_at")
    search_fields = ("title", "description", "owner__email")
    list_filter = ("created_at",)
