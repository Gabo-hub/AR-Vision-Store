from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GlassesViewSet, GlassesAdminViewSet

router = DefaultRouter()
router.register(r"", GlassesViewSet, basename="glasses")
router.register(r"admin", GlassesAdminViewSet, basename="glasses-admin")

urlpatterns = [
    path("", include(router.urls)),
]
