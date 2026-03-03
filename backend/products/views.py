from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Glasses
from .serializers import GlassesSerializer


class IsAdminUser(permissions.BasePermission):
    """
    Permite solo a administradores.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class GlassesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para ver lentes.
    Solo lectura para clientes.
    """

    queryset = Glasses.objects.all()
    serializer_class = GlassesSerializer


class GlassesAdminViewSet(viewsets.ModelViewSet):
    """
    API endpoint para administrar lentes.
    Solo para administradores.
    """

    parser_classes = (MultiPartParser, FormParser)
    queryset = Glasses.objects.all()
    serializer_class = GlassesSerializer
    permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
