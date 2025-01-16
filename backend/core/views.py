from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

@csrf_exempt  # Temporarily disable CSRF validation for testing
def upload_file(request):
    if request.method == "POST":
        user_id = request.POST.get("user_id")
        category = request.POST.get("category")
        file = request.FILES.get("file")

        if file:
            file_name = default_storage.save(f"uploads/{file.name}", ContentFile(file.read()))
            file_url = default_storage.url(file_name)
            return JsonResponse({"success": True, "file_url": file_url})
        else:
            return JsonResponse({"error": "No file uploaded"}, status=400)
    return JsonResponse({"error": "Invalid request"}, status=400)
