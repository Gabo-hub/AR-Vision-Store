"""
Roles disponibles para usuarios.
Agregar nuevos roles aquí para mantener consistencia en toda la aplicación.
"""


class Role:
    """
    Constantes de roles.
    Para agregar un nuevo rol, simplemente agregar una nueva constante aquí.
    """

    USUARIO = "usuario"
    ADMIN = "admin"

    CHOICES = [
        (USUARIO, "Usuario"),
        (ADMIN, "Administrador"),
    ]

    @classmethod
    def get_choices(cls):
        """Retorna las opciones para el campo choices de Django."""
        return cls.CHOICES

    @classmethod
    def get_default(cls):
        """Retorna el rol por defecto para nuevos usuarios."""
        return cls.USUARIO
