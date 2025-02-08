from django.shortcuts import render
from django.contrib.auth import login, logout
from google.oauth2 import id_token
from google.auth.transport import requests
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.exceptions import ValidationError
from django.db import IntegrityError

@ensure_csrf_cookie
@api_view(['POST'])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required'}, status=400)
    
    try:
        id_info = id_token.verify_oauth2_token(
            token, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID, 
            clock_skew_in_seconds=100
        )

        if not id_info['email_verified']:

            return Response({'error': 'Email not verified'}, status=400)
        
        user_email = id_info['email']

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            try:
                user = User.objects.create_user(
                    username=user_email,
                    email=user_email,
                    first_name=id_info.get('given_name', ''),
                    last_name=id_info.get('family_name', '')
                )
                user.set_unusable_password()
                user.save()
            except IntegrityError as e:
                print(f"IntegrityError during user creation: {str(e)}")
                return Response({'error': 'User already exists'}, status=400)

        login(request, user)
        print("User logged in successfully.")
        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'message': 'User created/Logged in successfully'
        })
    
    except ValueError as e:
        print(f"ValueError during token verification: {str(e)}")
        return Response({'error': 'Invalid token'}, status=400)
    except ValidationError as e:
        print(f"ValidationError: {str(e)}")
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return Response(
            {'error': 'Authentication failed. Please try again.'},
            status=400
        )

    
@api_view(['POST'])
def google_logout(request):
    logout(request)
    return Response({'message': 'User logged out successfully'})

@api_view(['GET'])
def check_session(request):
    if request.user.is_authenticated:
        return Response({'user': {
            'id': request.user.id,
            'email': request.user.email,
            'name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email
        }})
    return Response({'error': 'User is not logged in'}, status=400)