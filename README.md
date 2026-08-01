# VolenPark 🚗
> **Smart Valet & Peer-to-Peer Parking Marketplace**

VolenPark is a premium, startup-quality marketplace connecting **Car Owners**, **Parking Space Providers**, and **Valet Drivers** into a unified ecosystem. The platform leverages a Node.js/Express.js backend, a React/Vite frontend with rich Framer Motion animations and Leaflet maps, and a Python Django AI service for predictive modeling.

---

## 🏗️ Architecture & Tech Stack

### 1. Frontend (React + Vite)
- **UI/UX:** Tailwind CSS, Framer Motion for premium glassmorphic transitions.
- **Routing:** React Router v7.
- **Charts:** Recharts for dynamic provider analytics.
- **Mapping:** React Leaflet (OpenStreetMap) for location discovery.

### 2. Backend (Node.js + Express)
- **Database:** MongoDB via Mongoose.
- **Security:** Helmet, Express Rate Limiter, CORS, JWT Authorization.
- **Communication:** Socket.io for live reservation sync and real-time vehicle updates.

### 3. AI Service (Python + Django REST Framework)
- **Tech:** Pandas, NumPy, Scikit-Learn, TensorFlow, OpenCV.
- **Demand Prediction:** RandomForestRegressor estimating parking demand score.
- **Dynamic Pricing:** LinearRegression calculating price multipliers.
- **Vision:** Sequential Convolutional Neural Network (CNN) and OpenCV decoding for vehicle damage detection.

---

## 🚀 Setup & Launch Instructions

Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/volenpark_db`).

### 1. Python Django AI Service
```bash
cd ai-service
source venv/bin/activate
pip install -r requirements.txt
python manage.py runserver 5001
```

### 2. Node.js MERN Backend
```bash
cd backend
npm install
npm start
```
*Note: Make sure `backend/.env` is set up with `AI_SERVICE_URL=http://localhost:5001` and `PORT=5006`.*

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints

### 🧠 Python AI Microservice (`5001`)
- `POST /api/ai/predict-demand/` - Predict parking occupancy (0.0 to 1.0).
- `POST /api/ai/dynamic-price/` - Returns dynamic price multiplier.
- `POST /api/ai/recommend-parking/` - Score and rank list of parking spaces based on user coordinates.
- `POST /api/ai/detect-damage/` - Preprocesses image url using OpenCV, classifies damage using CNN.

### 🔌 MERN API Gateway (`5006`)
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Parking:** `POST /api/parking`, `GET /api/parking/mine`, `DELETE /api/parking/:id`
- **Bookings:** `POST /api/bookings`, `GET /api/bookings/provider`, `POST /api/bookings/:id/action`
- **Inspection:** `POST /api/inspection` (calls Python CNN vision model)
- **Analytics:** `GET /api/analytics/provider` (calls Python Scikit-learn demand model)
