from django.urls import path, include
from . import views

urlpatterns = [
    path('google_login/', views.google_login, name='google-login'),
    path('check_session/', views.check_session, name='check-session'),
    path('google_logout/', views.google_logout, name='google-logout'),
]