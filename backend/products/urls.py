from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GlassesViewSet

router = DefaultRouter()
router.register(r'', GlassesViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
