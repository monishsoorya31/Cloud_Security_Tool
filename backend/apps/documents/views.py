from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status

from services.ingestion import ingest_document


class DocumentViewSet(ViewSet):
    def create(self, request):
        #getting input from the user as json
        title = request.data.get("title")
        url = request.data.get("url")
        provider = request.data.get("provider")
        version = request.data.get("version")

        if not title or not url or not provider:
            return Response(
                {"error": "title, url, provider are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        #calling the ingest function 
        ingest_document(title, url, provider, version)

        return Response(
            {"message": "Document ingested it Would be Skipped if already exist"},
            status=status.HTTP_201_CREATED
        )



