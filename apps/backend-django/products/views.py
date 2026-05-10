from rest_framework import viewsets, permissions
from .models import Glasses
from .serializers import GlassesSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)

class GlassesViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y editar los lentes.
    Solo lectura para público, crear/editar/eliminar para admin.
    """
    queryset = Glasses.objects.all()
    serializer_class = GlassesSerializer
    permission_classes = [IsAdminOrReadOnly]
