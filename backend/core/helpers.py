from fhir.resources.documentreference import DocumentReference
from fhir.resources.fhirdate import FHIRDate

def create_document_reference(file_upload):
    # Create the DocumentReference resource
    doc_ref = DocumentReference()

    # Reference to the patient (subject)
    doc_ref.subject = {
        "reference": f"Patient/{file_upload.user_id}"
    }

    # Add the upload date of the document
    doc_ref.date = FHIRDate(file_upload.uploaded_at.isoformat())

    # Set the document type (e.g., prescription, lab result)
    doc_ref.type = {
        "coding": [
            {
                "system": "http://hl7.org/fhir/document-type",
                "code": file_upload.category,
                "display": file_upload.get_category_display(),
            }
        ]
    }

    # Add the document content, including the file URL and title
    doc_ref.content = [
        {
            "attachment": {
                "contentType": "application/octet-stream",
                "url": f"{file_upload.file.url}",
                "title": file_upload.file_name,
            }
        }
    ]

    return doc_ref.dict()