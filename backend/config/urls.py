from django.contrib import admin
from django.urls import path, include
from core import auth_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/auth/', include('autenticacion.urls')),
    path('api/auth/', include('users.urls')),
    path('admin/', admin.site.urls),
    path('api/blog/', include('blog.urls')),
    path('api/cms/', include('cms.urls')),
    path('api/auth/csrf/', auth_views.get_csrf_token, name='csrf'),
    path('api/auth/login/', auth_views.login_view, name='login'),
    path('api/auth/logout/', auth_views.logout_view, name='logout'),
    path('api/auth/me/', auth_views.me_view, name='me'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
