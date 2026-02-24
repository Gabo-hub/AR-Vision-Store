from django.db import models

class Glasses(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nombre")
    description = models.TextField(blank=True, verbose_name="Descripción")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio")
    thumbnail = models.ImageField(upload_to='glasses/thumbnails/', verbose_name="Miniatura")
    model_3d_file = models.FileField(upload_to='glasses/models/', verbose_name="Modelo 3D (.glb)")
    
    # Parámetros de configuración AR (Valores por defecto sugeridos para el Virtual Try-On)
    scale_factor = models.FloatField(default=0.15, verbose_name="Factor de escala")
    offset_x = models.FloatField(default=0.0, verbose_name="Desplazamiento X")
    offset_y = models.FloatField(default=0.02, verbose_name="Desplazamiento Y")
    offset_z = models.FloatField(default=0.0, verbose_name="Desplazamiento Z")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Lente"
        verbose_name_plural = "Lentes"
        ordering = ['-created_at']

    def __str__(self):
        return self.name
