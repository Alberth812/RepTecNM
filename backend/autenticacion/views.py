import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator

logger = logging.getLogger(__name__)

@method_decorator(ensure_csrf_cookie, name='dispatch')
class LoginView(APIView):
    # Permitir GET explícitamente para que el frontend obtenga el token CSRF
    def get(self, request):
        return Response({'csrfToken': get_token(request)}, status=status.HTTP_200_OK)
    
    def post(self, request):
        identifier = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        
        logger.info(f"🔍 Intento de login con identifier: '{identifier}'")
        
        if not identifier or not password:
            return Response(
                {'detail': 'Correo y contraseña son obligatorios'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Intentar autenticar primero con el identificador tal cual (por si es username)
        user = authenticate(request, username=identifier, password=password)
        
        # Si falla, intentar buscar por email y autenticar con su username real
        if user is None:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                logger.info(f"✅ Usuario encontrado por email: {user_obj.username}")
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                logger.warning(f"❌ No existe usuario con email: {identifier}")
                user = None
        
        if user is not None:
            login(request, user)
            logger.info(f"🎉 Login exitoso para: {user.username}")
            return Response({
                'message': 'Autenticación exitosa',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'is_admin': user.is_superuser or user.is_staff
                }
            }, status=status.HTTP_200_OK)
        
        logger.warning(f"❌ Credenciales inválidas para: {identifier}")
        return Response(
            {'detail': 'Credenciales inválidas. Verifica tu correo y contraseña.'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

class LogoutView(APIView):
    def post(self, request):
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Sesión cerrada'}, status=status.HTTP_200_OK)

class MeView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'username': request.user.username,
                'email': request.user.email,
                'is_admin': request.user.is_superuser or request.user.is_staff
            })
        return Response({'detail': 'No autenticado'}, status=status.HTTP_401_UNAUTHORIZED)
