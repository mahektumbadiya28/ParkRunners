import io
import os
import cv2
import datetime
import stripe
import numpy as np
import pandas as pd
from typing import Literal
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Response
from pydantic import BaseModel, Field
from cryptography.fernet import Fernet
from passlib.context import CryptContext
from sklearn.linear_model import LinearRegression

# --- 1. DATABASE & ORM ENGINE INITIALIZATION ---
from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///./parkrunners.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 2. ORM DATABASE SCHEMAS ---
class DBUser(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)

class DBMessage(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sender_id = Column(Integer, nullable=False)
    receiver_id = Column(Integer, nullable=False)
    text = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class DBParkingSpot(Base):
    __tablename__ = "parking_spots"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    spot_type = Column(String, nullable=False) 
    base_price = Column(Integer, nullable=False)

Base.metadata.create_all(bind=engine)

# --- 3. SECURITY & CRYPTO SERVICES ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = Fernet.generate_key()
cipher_suite = Fernet(SECRET_KEY)
stripe.api_key = "sk_test_mock_parkrunners_key"

# --- 4. MACHINE LEARNING ENGINE ---
historical_data = {
    "demand_level":  [1, 2, 5, 8, 9, 3, 4, 7, 10, 2],
    "is_rush_hour":  [0, 0, 1, 1, 1, 0, 0, 1,  1, 0],
    "is_event_near": [0, 1, 0, 0, 1, 0, 1, 1,  1, 0],
    "final_price":   [10, 15, 25, 35, 45, 12, 22, 38, 55, 11]
}
df = pd.DataFrame(historical_data)
pricing_model = LinearRegression().fit(df[["demand_level", "is_rush_hour", "is_event_near"]], df["final_price"])

# --- 5. FASTAPI APPLICATION DEFINITION ---
app = FastAPI(title="ParkRunners Master API Backend", version="4.0")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- 6. DATA TRANSMISSION PIPELINE PYDANTICS ---
class UserRegisterInput(BaseModel):
    name: str
    email: str
    password: str
    role: Literal["driver", "valet", "host"]

class LoginInput(BaseModel):
    email: str
    password: str

class PricingInput(BaseModel):
    demand_level: int = Field(..., ge=1, le=10)
    is_rush_hour: int
    is_event_near: int

class MessageInput(BaseModel):
    sender_id: int
    receiver_id: int
    text: str

class PaymentIntentInput(BaseModel):
    amount_in_cents: int
    driver_id: int
    spot_id: int

# --- 7. CORE ROUTING CONTROLLERS ---
@app.get("/")
def health(): return {"status": "online", "framework": "ParkRunners Engine Framework V4"}

@app.post("/register")
def register_user(user_data: UserRegisterInput, db: Session = Depends(get_db)):
    if db.query(DBUser).filter(DBUser.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = DBUser(name=user_data.name, email=user_data.email, password=pwd_context.hash(user_data.password), role=user_data.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.user_id, "name": new_user.name, "email": new_user.email, "role": new_user.role}

@app.post("/login")
def login_user(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.password):
        raise HTTPException(status_code=400, detail="Invalid Email or Password")
    return {"status": "authenticated", "user": {"id": user.user_id, "name": user.name, "role": user.role}}

@app.get("/valet/{user_id}/qrcode")
def get_valet_qrcode(user_id: int, db: Session = Depends(get_db)):
    user = db.query(DBUser).filter(DBUser.user_id == user_id).first()
    if not user or user.role != "valet": raise HTTPException(status_code=400, detail="Invalid Valet credentials")
    import qrcode
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(cipher_suite.encrypt(f"valet_id:{user.user_id}".encode()).decode())
    qr.make(fit=True)
    buf = io.BytesIO()
    qr.make_image(fill_color="black", back_color="white").save(buf, format="PNG")
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="image/png")

@app.post("/ai/predict-price")
def get_dynamic_price(data: PricingInput):
    pred = pricing_model.predict(np.array([[data.demand_level, data.is_rush_hour, data.is_event_near]]))[0]
    return {"suggested_price": f"${max(5.0, round(float(pred), 2))}"}

from ultralytics import YOLO

# Load your custom fine-tuned model weights on backend bootup
# (For testing before full training, you can use "yolov8n.pt" which detects generic cars/objects)
damage_detector = YOLO("yolov8n.pt") 

@app.post("/ai/scan-damage")
async def scan_car_damage(file: UploadFile = File(...)):
    # 1. Read uploaded file bytes directly into an OpenCV matrix
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    # 2. RUN DEEP LEARNING INFERENCE: Pass the matrix straight into YOLO
    results = damage_detector(img)[0]
    
    # 3. DRAW DETECTED BOUNDING BOXES: Loop through found anomalies
    for box in results.boxes:
        # Extract coordinates of the bounding box
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        
        # Get confidence score and class index
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = results.names[class_id]
        
        # Only draw boxes if the model is more than 40% confident
        if confidence > 0.40:
            # Draw bright bounding boxes directly onto original image array
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 0, 255), 3) # Red Box
            
            # Label text overlay (e.g., "scratch: 89%")
            label = f"{class_name} {confidence:.2f}"
            cv2.putText(img, label, (x1, max(y1 - 10, 20)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

    # 4. Stream modified image frame array back to JavaScript client
    _, encoded = cv2.imencode('.png', img)
    return Response(content=io.BytesIO(encoded.tobytes()).getvalue(), media_type="image/png")
@app.post("/chat/send")
def send_message(data: MessageInput, db: Session = Depends(get_db)):
    db.add(DBMessage(sender_id=data.sender_id, receiver_id=data.receiver_id, text=data.text))
    db.commit()
    return {"status": "sent"}

@app.get("/chat/history/{user_a}/{user_b}")
def get_chat_history(user_a: int, user_b: int, db: Session = Depends(get_db)):
    msgs = db.query(DBMessage).filter(((DBMessage.sender_id == user_a) & (DBMessage.receiver_id == user_b)) | ((DBMessage.sender_id == user_b) & (DBMessage.receiver_id == user_a))).order_by(DBMessage.timestamp.asc()).all()
    return [{"sender": m.sender_id, "text": m.text} for m in msgs]

@app.get("/map/spots")
def get_parking_spots():
    return [
        {"id": 1, "title": "John's Driveway Spot", "latitude": 37.78825, "longitude": -122.4324, "type": "peer_to_peer", "price": 12},
        {"id": 2, "title": "Central Mall Valet Hub", "latitude": 37.78925, "longitude": -122.4344, "type": "public", "price": 35}
    ]

@app.post("/payments/create-intent")
def create_payment_intent(data: PaymentIntentInput):
    return {"status": "requires_payment_method", "client_secret": f"pi_mock_secret_{data.driver_id}", "amount": f"${data.amount_in_cents / 100:.2f}"}