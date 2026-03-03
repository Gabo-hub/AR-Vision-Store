from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User
from .roles import Role


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Inicia sesión y retorna información del usuario.
    """
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Usuario y contraseña son requeridos"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED
        )

    login(request._request, user)

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Cierra sesión.
    """
    logout(request._request)
    return Response({"message": "Sesión cerrada exitosamente"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    """
    Retorna información del usuario actual.
    """
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "is_admin": user.is_admin,
        }
    )
