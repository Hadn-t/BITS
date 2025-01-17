from django.db import models

# Create your models here.
class FileUpload(models.Model):
    CATEGORY_CHOICES = [
        ('prescription', 'Prescription'),
        ('lab_result', 'Lab Result'),
    ]

    file_name = models.CharField(max_length=50, default='report')
    user_id = models.CharField(max_length=150)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    file = models.FileField(upload_to='uploads/%Y/%m/%d')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.user_id}"    