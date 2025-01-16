from rest_framework import serializers
from .models import FileUpload

class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    class Meta:
        model = FileUpload
        fields = '__all__'