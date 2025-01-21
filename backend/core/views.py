from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .serializers import FileUploadSerializer
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import FileUpload
from .serializers import FileUploadSerializer


# from .helpers import create_document_reference

# def get_document_reference(request, file_id):
#     try:
#         # Retrieve the file upload object
#         file_upload = FileUpload.objects.get(id=file_id)

#         # Create the FHIR DocumentReference resource
#         document_reference = create_document_reference(file_upload)

#         # Return the document reference as JSON
#         return JsonResponse(document_reference, safe=False)

#     except FileUpload.DoesNotExist:
#         return JsonResponse({"error": "File not found"}, status=404)
    


@csrf_exempt
def upload_file(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        category = request.POST.get('category')
        file = request.FILES.get('file')

        if not user_id or not category or not file:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            # Save the uploaded file in the database
            file_upload = FileUpload(
                user_id=user_id,
                category=category,
                file=file,  # The actual file here
                file_name=request.POST.get('name', 'default_file_name')
            )
            file_upload.save()

            return JsonResponse({"message": "File uploaded successfully"}, status=200)

        except Exception as e:
            return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

@api_view(['GET'])
def get_user_files(request, user_id):
    try:
        # Fetch files for the user
        files = FileUpload.objects.filter(user_id=user_id)

        # If no files are found, return a 404 response
        if not files:
            return Response({"error": "No files found for this user"}, status=404)

        # Serialize the file data
        serialized_files = FileUploadSerializer(files, many=True)

        # Return files data along with additional info
        return Response({
            'files': serialized_files.data
        }, status=200)

    except Exception as e:
        return Response({"error": f"Error retrieving files: {str(e)}"}, status=500)