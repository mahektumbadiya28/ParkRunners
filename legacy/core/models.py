from django.db import models

# Create your models here.
from django.contrib.auth.models import User

# --- Django Built-In User Models handle registration & authentication automatically --- 

class DBMessage(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver_id = models.IntegerField() # Supporting standalone receiver tracking IDs
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

class DBParkingSpot(models.Model):
    title = models.CharField(max_length=255)
    latitude = models.FloatField()  # Using Python's native primitive float mapping
    longitude = models.FloatField()
    spot_type = models.CharField(max_length=50) # 'peer_to_peer' or 'public'
    base_price = models.IntegerField()

    def __str__(self):
        return self.title