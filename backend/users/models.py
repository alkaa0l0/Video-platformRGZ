import secrets

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """Менеджер для модели User с email как уникальным идентификатором."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Email обязателен")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser должен иметь is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser должен иметь is_superuser=True.")
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Пользователь видеоплатформы.
    Логин — email. Доп. поле access_code используется как одноразовый код
    для восстановления доступа (см. экран «Код доступа» в дизайне).
    """
    username = None
    email = models.EmailField("email", unique=True)
    first_name = models.CharField("Имя", max_length=64, blank=True)
    last_name = models.CharField("Фамилия", max_length=64, blank=True)
    chat_name = models.CharField("Имя в чате", max_length=64, blank=True)
    access_code = models.CharField("Код доступа", max_length=8, blank=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

    def __str__(self) -> str:
        return self.email

    def generate_access_code(self) -> str:
        """Генерирует и сохраняет короткий код доступа."""
        code = "".join(secrets.choice("0123456789") for _ in range(6))
        self.access_code = code
        self.save(update_fields=["access_code"])
        return code
