from rest_framework import viewsets
from .models import Glasses
from .serializers import GlassesSerializer

class GlassesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que permite ver los lentes.
    Solo lectura para el frontend de la tienda.
    """
    queryset = Glasses.objects.all()
    serializer_class = GlassesSerializer
