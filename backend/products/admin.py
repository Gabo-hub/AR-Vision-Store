from django.contrib import admin
from .models import Glasses

@admin.register(Glasses)
class GlassesAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'price')
        }),
        ('Archivos Multimedia', {
            'fields': ('thumbnail', 'model_3d_file')
        }),
        ('Configuración AR (Virtual Try-On)', {
            'description': 'Ajustes finos para el posicionamiento del modelo 3D sobre el rostro.',
            'fields': ('scale_factor', 'offset_x', 'offset_y', 'offset_z')
        }),
    )
