from django.db import models
from django.contrib.auth import get_user_model
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
    
    
User = get_user_model()

class DoctorProfile(models.Model):
    user_name= models.ForeignKey(User, on_delete=models.CASCADE)
    name= models.TextField()
    doctor_type= models.TextField()
    hospital= models.CharField(max_length=50)
    Education= models.CharField(max_length=20)
    age= models.IntegerField()
    hometown= models.TextField(blank=True)
    
    
    
    def __str__(self):
        return self.user_name
    