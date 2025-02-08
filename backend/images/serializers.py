from rest_framework import serializers
from .models import Images

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
        fields = [
            'id', 'user', 'title', 'image',
            'width', 'height', 'file_size', 'file_type',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user','id','width', 'height', 'file_size', 'file_type',
            'created_at', 'updated_at'
        ]
    