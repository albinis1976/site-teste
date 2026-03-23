import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

logger = logging.getLogger('frontend')

class FrontendLogView(APIView):
    permission_classes = [AllowAny] # Allowed so anyone can report errors, even unauth

    def post(self, request):
        level = request.data.get('level', 'ERROR').upper()
        message = request.data.get('message', 'No message provided')
        meta = request.data.get('meta', {})
        user = request.user if request.user.is_authenticated else "Anonymous"

        log_msg = f"Frontend [{level}] (User: {user}): {message} | Meta: {meta}"
        
        if level == 'DEBUG':
            logger.debug(log_msg)
        elif level == 'INFO':
            logger.info(log_msg)
        elif level == 'WARNING':
            logger.warning(log_msg)
        else:
            logger.error(log_msg)

        return Response({"status": "logged"}, status=status.HTTP_200_OK)
