from django.db import models
import uuid
from django.contrib.auth.models import User

class Images(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to='images/%Y/%m/%d/')
    width = models.IntegerField(null=True)
    height = models.IntegerField(null=True)
    file_size = models.IntegerField(null=True)
    file_type = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.image and not self.width:
            from PIL import Image as PILImage
            img = PILImage.open(self.image)
            self.width, self.height = img.size
            self.file_type = self.image.name.split('.')[-1].lower()
            self.file_size = self.image.size
        super().save(*args, **kwargs)