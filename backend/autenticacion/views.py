import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
        identifier = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=identifier, password=password)
        
        if user is None and '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
            except User.MultipleObjectsReturned:
                return JsonResponse({"success": False, "error": "Múltiples cuentas con este correo."}, status=400)

        if user is not None:
            login(request, user)
            rol = 'admin' if user.is_staff or user.is_superuser else 'afiliado'
            return JsonResponse({
                "success": True,
                "rol": rol,
                "nombre": user.get_full_name() or user.username,
                "email": user.email
            })
        return JsonResponse({"success": False, "error": "Credenciales inválidas"}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Datos inválidos"}, status=400)

@require_POST
def logout_view(request):
    """Cierra la sesión y limpia la cookie de forma segura."""
    logout(request)
    response = JsonResponse({"success": True})
    # Forzar la eliminación de la cookie de sesión en el navegador
    response.delete_cookie('sessionid', path='/')
    return response

def me_view(request):
    if request.user.is_authenticated:
        user = request.user
        rol = 'admin' if user.is_staff or user.is_superuser else 'afiliado'
        return JsonResponse({
            "authenticated": True,
            "rol": rol,
            "nombre": user.get_full_name() or user.username,
            "email": user.email
        })
    return JsonResponse({"authenticated": False}, status=401)
