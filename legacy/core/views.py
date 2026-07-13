from django.shortcuts import render

# Create your views here.
import io
import cv2
import numpy as np
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from ultralytics import YOLO

from .models import DBMessage, DBParkingSpot
from .serializers import UserRegisterSerializer, MessageSerializer, ParkingSpotSerializer

# Load the core AI target model onto runtime stack memory
damage_detector = YOLO("yolov8n.pt")

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return JsonResponse({
            "token": str(refresh.access_token),
            "user": {"id": user.id, "username": user.username}
        }, status=status.HTTP_201_CREATED)
    return JsonResponse(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_parking_spots(request):
    spots = [
        {"id": 1, "title": "John's Driveway Spot", "latitude": 37.78825, "longitude": -122.4324, "type": "peer_to_peer", "price": 12},
        {"id": 2, "title": "Central Mall Valet Hub", "latitude": 37.78925, "longitude": -122.4344, "type": "public", "price": 35}
    ]
    return JsonResponse(spots, safe=False)

@api_view(['POST'])
@permission_classes([AllowAny]) # Allows mobile devices to upload frames freely
def scan_car_damage(request):
    if 'file' not in request.FILES:
        return JsonResponse({"detail": "No image matrix file uploaded"}, status=400)
    
    # Read incoming binary memory stream directly into matrix array
    uploaded_file = request.FILES['file']
    img_bytes = uploaded_file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Fire YOLO inference sequence 
    results = damage_detector(img)[0]

    for box in results.boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])
        if confidence > 0.40:
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3)
            label = f"Damage: {confidence:.2f}"
            cv2.putText(img, label, (x1, max(y1 - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    _, encoded = cv2.imencode('.png', img)
    return HttpResponse(io.BytesIO(encoded.tobytes()).getvalue(), content_type="image/png")

@api_view(['POST'])
def send_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse({"status": "sent"}, status=201)
    return JsonResponse(serializer.errors, status=400)

@api_view(['GET'])
def get_chat_history(request, user_a, user_b):
    messages = DBMessage.objects.filter(
        (models.Q(sender_id=user_a) & models.Q(receiver_id=user_b)) |
        (models.Q(sender_id=user_b) & models.Q(receiver_id=user_a))
    ).order_by('timestamp')
    serializer = MessageSerializer(messages, many=True)
    return JsonResponse([{"sender": m['sender'], "text": m['text']} for m in serializer.data], safe=False)

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return JsonResponse({
        "status": "online", 
        "framework": "Django REST Framework (LJU Syllabus Edition)"
    })

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as django_login
from django.contrib.auth.decorators import login_required

def web_login(request):
    if request.method == "POST":
        # Parse plain-text browser inputs securely via Django authentication engine
        user = authenticate(username=request.POST['username'], password=request.POST['password'])
        if user is not None:
            django_login(request, user)
            return redirect('web_dashboard')
        else:
            return render(request, 'core/login.html', {"error": "Invalid Web Credentials"})
    return render(request, 'core/login.html')

@login_required(login_url='web_login')
def web_dashboard(request):
    return render(request, 'core/dashboard.html')