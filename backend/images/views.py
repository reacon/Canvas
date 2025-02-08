from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Images
from .serializers import ImageSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from PIL import Image as PILImage
from PIL import ImageOps, ImageFilter
import numpy as np
from io import BytesIO
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
import os
from django.http import HttpResponse
from django.conf import settings
import requests
from openai import OpenAI

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Images.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return Images.objects.filter(user=self.request.user)
    

    @csrf_exempt
    def create(self,request,*args,**kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['put'])
    def update_image(self,request,pk = None):
        try:
            img = self.get_object()
            img.image.delete(save=False)
            serializer = self.get_serializer(img, data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data)
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['delete'])
    def delete_image(self,request,pk=None):
        try:
            img = self.get_object()
            file_path = img.image.path

            if os.path.isfile(file_path):
                os.remove(file_path)

            img.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Images.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)    

    @action(detail=False,methods=['post'])
    def resize(self,request):
        try:
            img = request.FILES.get('image')
            width = int(request.data.get('width',300))
            height = int(request.data.get('height',300))

            img = PILImage.open(img)
            size = (width,height)
            resized = ImageOps.contain(img,size)

            buffer = BytesIO()
            resized.save(buffer,format='PNG')
            buffer.seek(0)

            return HttpResponse(buffer.getvalue(),status=status.HTTP_200_OK,content_type='image/png')

        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False,methods=['post'])
    def rotate(self,request):
        try:
            img = request.FILES.get('image')
            angle = int(request.data.get('degrees',90))

            img = PILImage.open(img)
            rotated = img.rotate(angle,expand=True)

            buffer = BytesIO()
            rotated.save(buffer,format='PNG')
            buffer.seek(0)

            return HttpResponse(buffer.getvalue(),status=status.HTTP_200_OK,content_type='image/png')

        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False,methods=['post'])
    def transpose(self,request):
        try:
            img = request.FILES.get('image')
            direction = request.data.get('direction')
            img = PILImage.open(img)
            
            if direction == 'horizontal':
                transposed = img.transpose(PILImage.Transpose.FLIP_LEFT_RIGHT)
            elif direction == 'vertical':
                transposed = img.transpose(PILImage.Transpose.FLIP_TOP_BOTTOM)
            
            buffer = BytesIO()
            transposed.save(buffer,format='PNG')
            buffer.seek(0)

            return HttpResponse(buffer.getvalue(),status=status.HTTP_200_OK,content_type='image/png')


        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False,methods=['post'])
    def blur(self,request):
        try:
            img = request.FILES.get('image')
            radius = int(float(request.data.get('radius',5)))
            x = int(float(request.data.get('x')))
            y = int(float(request.data.get('y')))
            area = 50

            img = PILImage.open(img)
            x1 = max(x - area // 2, 0)
            y1 = max(y - area // 2, 0)
            x2 = min(x + area // 2, img.width)  
            y2 = min(y + area // 2, img.height)

            region = img.crop((x1,y1,x2,y2))
            blurred = region.filter(ImageFilter.GaussianBlur(radius))
            img.paste(blurred,(x1,y1,x2,y2))

            buffer = BytesIO()
            img.save(buffer,format='PNG')
            buffer.seek(0)

            return HttpResponse(buffer.getvalue(),status=status.HTTP_200_OK,content_type='image/png')

        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False,methods=['post'])
    def crop(self,request):
        try:
            img = request.FILES.get('image')
            width = int(float(request.data.get('width')))
            height = int(float(request.data.get('height')))
            x = int(float(request.data.get('x')))
            y = int(float(request.data.get('y')))

            img = PILImage.open(img)
            cropped = img.crop((x,y,x+width,y+height))

            buffer = BytesIO()
            cropped.save(buffer,format='PNG')
            buffer.seek(0)
            print(buffer.getvalue())

            return HttpResponse(buffer.getvalue(),status=status.HTTP_200_OK,content_type='image/png')

        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False,methods=['post'])
    def generate(self,request):
        try:
            prompt = request.data.get('prompt')
            quality = request.data.get('quality',"hd")
            api_key = settings.OPEN_AI_API_KEY
            client = OpenAI(api_key=api_key)

            response = client.images.generate(model="dall-e-3",prompt=prompt,n=1,response_format='url',quality=quality)

            return Response(response.data[0].url,status=status.HTTP_200_OK)

        except Exception as e:
            print("Unexpected error:", str(e))
            return Response(status=status.HTTP_400_BAD_REQUEST)
    
            