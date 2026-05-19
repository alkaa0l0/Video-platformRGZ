from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    tokens_for_user,
)


class RegisterView(APIView):
    """POST /api/auth/register/ — регистрация пользователя."""
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens_for_user(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """POST /api/auth/login/ — авторизация по email и паролю."""
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": tokens_for_user(user),
            }
        )


class MeView(APIView):
    """GET/PATCH /api/auth/me/ — текущий пользователь."""

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class RequestAccessCodeView(APIView):
    """
    POST /api/auth/access-code/ — отправка кода доступа на email.
    Соответствует экрану «Код доступа» из дизайна.
    В продакшене код нужно отправлять письмом; здесь возвращается в ответе
    для удобства разработки.
    """
    permission_classes = (AllowAny,)

    def post(self, request):
        email = (request.data.get("email") or "").lower().strip()
        if not email:
            return Response(
                {"email": ["Поле обязательно для заполнения."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Не раскрываем существование email — отвечаем нейтрально
            return Response({"detail": "Если email зарегистрирован, код отправлен."})

        code = user.generate_access_code()
        return Response(
            {
                "detail": "Код доступа отправлен на email.",
                # debug_code оставлен для разработки; в проде убрать
                "debug_code": code,
            }
        )
