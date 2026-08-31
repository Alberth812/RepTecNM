import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    """Devuelve un token CSRF para que el frontend pueda hacer peticiones POST seguras."""
    return JsonResponse({"detail": "CSRF cookie set"})

@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Determinamos el rol: si es superusuario o staff, es admin. Si no, afiliado.
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

@login_required
def logout_view(request):
    logout(request)
    return JsonResponse({"success": True})

@login_required
def me_view(request):
    """Verifica el estado de la sesión actual."""
    user = request.user
    rol = 'admin' if user.is_staff or user.is_superuser else 'afiliado'
    return JsonResponse({
        "authenticated": True,
        "rol": rol,
        "nombre": user.get_full_name() or user.username,
        "email": user.email
    })
