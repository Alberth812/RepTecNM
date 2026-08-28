from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicacionBlogViewSet

router = DefaultRouter()
router.register(r'publicaciones', PublicacionBlogViewSet, basename='blog-publicaciones')

urlpatterns = [
    path('', include(router.urls)),
]
