from django.urls import path
from .views import FileUploadView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)