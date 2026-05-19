from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "first_name", "last_name", "chat_name")
        read_only_fields = ("id", "email")


class RegisterSerializer(serializers.ModelSerializer):
    """
    Регистрация: email, фамилия, имя, пароль.
    Соответствует экрану «Регистрация» из дизайна.
    """
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "password")

    def validate_email(self, value: str) -> str:
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value.lower()

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            chat_name=validated_data.get("first_name", "") or "Гость",
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs["email"].lower(),
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Неверный email или пароль.")
        if not user.is_active:
            raise serializers.ValidationError("Учётная запись отключена.")
        attrs["user"] = user
        return attrs


def tokens_for_user(user: User) -> dict:
    """Возвращает пару access/refresh токенов для пользователя."""
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}
