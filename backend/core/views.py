from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import FileUpload
from .serializers import FileUploadSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view


@csrf_exempt  # Temporarily disable CSRF validation for testing
def upload_file(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        category = request.POST.get('category')
        file = request.FILES.get('file')
        file_name = request.POST.get('name')

        if not user_id or not category or not file:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Save the uploaded file in the database
        file_upload = FileUpload(
            user_id=user_id,
            category=category,
            file=file,
            file_name = request.POST.get('name', 'default_file_name')
        )
        file_upload.save()  # Ensure saving the record

        return JsonResponse({"message": "File uploaded successfully"}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=405)



@api_view(['GET'])
def get_user_files(request, user_id):
    #Fetching files on the basis of uid
    files = FileUpload.objects.filter(user_id=user_id)

    #serilizing the query to send back to the client
    serializer = FileUploadSerializer(files, many=True)

    #return the response as json (application/JSON)
    return JsonResponse({'files': serializer.data})