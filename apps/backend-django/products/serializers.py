from rest_framework import serializers
from .models import Glasses

class GlassesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Glasses
        fields = [
            'id', 'name', 'description', 'price', 'thumbnail', 
            'model_3d_file', 'scale_factor', 'offset_x', 
            'offset_y', 'offset_z', 'created_at', 'updated_at'
        ]
