from rest_framework.views import exception_handler
from core.exceptions import ApplicationError
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import status
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the custom exception handling.
    if isinstance(exc, ApplicationError):
        data = {"detail": str(exc)}
        if exc.extra:
            data["extra"] = exc.extra
        return Response(data, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, ObjectDoesNotExist):
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    return response
