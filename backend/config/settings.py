import os
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-dev-key')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,backend', cast=Csv())
INSTALLED_APPS = [
    'autenticacion',
    'users',
    'cms',
    'blog',
    'django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes',
    'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles',
    'rest_framework', 'corsheaders', 'storages',
    'core', 'afiliados', 'publicaciones', 'media_manager',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', 'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware', 'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.debug', 'django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB', default='asociacion_db'),
        'USER': config('POSTGRES_USER', default='user'),
        'PASSWORD': config('POSTGRES_PASSWORD', default='password'),
        'HOST': config('DB_HOST', default='db'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

CORS_ALLOWED_ORIGINS = ["http://localhost", "http://127.0.0.1", "http://frontend:3000"]

# Configuración MinIO


# ==========================================
# SEGURIDAD Y COOKIES (Desarrollo/Producción)
# ==========================================
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = os.environ.get('SESSION_COOKIE_SECURE', 'False').lower() == 'true'
CSRF_COOKIE_SECURE = os.environ.get('CSRF_COOKIE_SECURE', 'False').lower() == 'true'
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_SAMESITE = 'Lax'

# ==========================================
# STATIC & MEDIA FILES
# ==========================================
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media_files'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
