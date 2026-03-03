"""
Modelos de usuarios.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models
from .roles import Role


class User(AbstractUser):
    """
    Modelo de usuario personalizado con soporte para roles.

    Agregar campos adicionales según sea necesario.
    """

    role = models.CharField(
        max_length=20,
        choices=Role.get_choices(),
        default=Role.get_default(),
        help_text="Rol del usuario en el sistema",
    )

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return self.username

    @property
    def is_admin(self):
        """Verifica si el usuario es administrador."""
        return self.role == Role.ADMIN

    @property
    def is_usuario(self):
        """Verifica si el usuario es un usuario regular."""
        return self.role == Role.USUARIO
