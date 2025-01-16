from django.urls import path
from .views import upload_file, get_user_files
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('upload/', upload_file, name='file-upload'),
    path('user/<str:user_id>/files/', get_user_files, name='get_user_files'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)