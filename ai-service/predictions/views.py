import json
import numpy as np
import pandas as pd
from django.http import JsonResponse
from rest_framework.decorators import api_view
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression

# Initialize and train a mock ML model for Demand Prediction on startup
# This represents a production pattern where models are loaded or trained on startup
demand_model = RandomForestRegressor(n_estimators=10, random_state=42)
# Synthetic training data: [Hour, DayOfWeek, IsHoliday, Temperature]
X_train_demand = np.array([
    [8, 0, 0, 25], [9, 0, 0, 26], [12, 0, 0, 28], [18, 0, 0, 27],
    [22, 0, 0, 22], [8, 5, 0, 20], [12, 5, 0, 24], [18, 5, 0, 23],
    [9, 1, 1, 24], [14, 2, 1, 27], [17, 3, 0, 26], [20, 4, 0, 22]
])
y_train_demand = np.array([0.8, 0.9, 0.7, 0.85, 0.3, 0.4, 0.6, 0.5, 0.2, 0.3, 0.75, 0.6])
demand_model.fit(X_train_demand, y_train_demand)

# Initialize and train a dynamic pricing regression model on startup
pricing_model = LinearRegression()
# Synthetic training data: [DemandScore, AvailabilityRate, IsWeekend]
X_train_price = np.array([
    [0.2, 0.9, 0], [0.4, 0.8, 0], [0.6, 0.6, 0], [0.8, 0.3, 1],
    [0.9, 0.1, 1], [0.5, 0.7, 1], [0.3, 0.9, 0], [0.7, 0.4, 0]
])
y_train_price = np.array([1.0, 1.1, 1.25, 1.5, 1.8, 1.35, 1.0, 1.3])
pricing_model.fit(X_train_price, y_train_price)

@api_view(['POST'])
def predict_demand(request):
    """
    POST /api/ai/predict-demand/
    Input: { "date": "2026-07-27", "time": "14:30", "weather": "Sunny", "is_holiday": false, "location": "Downtown" }
    Output: { "success": true, "expected_demand": 0.75 }
    """
    try:
        data = request.data
        time_str = data.get('time', '12:00')
        hour = int(time_str.split(':')[0])
        
        date_str = data.get('date', '2026-07-27')
        day_of_week = pd.to_datetime(date_str).dayofweek
        
        is_holiday = 1 if data.get('is_holiday', False) else 0
        
        # Map weather to temperature heuristic
        weather = data.get('weather', 'Sunny').lower()
        temp = 25
        if 'rain' in weather:
            temp = 18
        elif 'snow' in weather:
            temp = 2
        elif 'hot' in weather:
            temp = 35

        # Perform inference using our RandomForestRegressor
        features = np.array([[hour, day_of_week, is_holiday, temp]])
        prediction = demand_model.predict(features)[0]
        
        # Ensure prediction is within realistic bounds (0.0 to 1.0)
        prediction = max(0.0, min(1.0, float(prediction)))

        return JsonResponse({
            'success': True,
            'message': 'Demand prediction successful',
            'expected_demand': round(prediction, 2)
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@api_view(['POST'])
def dynamic_pricing(request):
    """
    POST /api/ai/dynamic-price/
    Input: { "demand": 0.8, "availability_rate": 0.3, "is_weekend": true }
    Output: { "success": true, "price_multiplier": 1.5 }
    """
    try:
        data = request.data
        demand = float(data.get('demand', 0.5))
        availability_rate = float(data.get('availability_rate', 0.5))
        is_weekend = 1 if data.get('is_weekend', False) else 0

        # Perform inference using LinearRegression
        features = np.array([[demand, availability_rate, is_weekend]])
        prediction = pricing_model.predict(features)[0]
        
        # Ensure prediction is a realistic multiplier (e.g. 0.8 to 2.5)
        multiplier = max(0.8, min(2.5, float(prediction)))

        return JsonResponse({
            'success': True,
            'message': 'Dynamic pricing calculation successful',
            'price_multiplier': round(multiplier, 2)
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)

@api_view(['POST'])
def recommend_parking(request):
    """
    POST /api/ai/recommend-parking/
    Input: {
        "user_lat": 12.9716,
        "user_lng": 77.5946,
        "parking_spaces": [
            {"id": "1", "lat": 12.9720, "lng": 77.5950, "price": 50, "rating": 4.5, "available_slots": 5},
            {"id": "2", "lat": 12.9800, "lng": 77.6000, "price": 30, "rating": 4.0, "available_slots": 0}
        ]
    }
    Output: { "success": true, "recommendations": [...] }
    """
    try:
        data = request.data
        user_lat = float(data.get('user_lat', 0.0))
        user_lng = float(data.get('user_lng', 0.0))
        spaces = data.get('parking_spaces', [])

        if not spaces:
            return JsonResponse({'success': True, 'recommendations': []})

        scored_spaces = []
        for space in spaces:
            space_lat = float(space.get('lat', 0.0))
            space_lng = float(space.get('lng', 0.0))
            
            # Simple Haversine approximation
            distance = np.sqrt((space_lat - user_lat)**2 + (space_lng - user_lng)**2) * 111.0 # km
            
            price = float(space.get('price', 50.0))
            rating = float(space.get('rating', 4.0))
            available = int(space.get('available_slots', 1))
            
            # Smart scoring recommendation engine
            # Lower distance is better, lower price is better, higher rating is better, must have availability
            if available <= 0:
                score = -999.0
            else:
                score = (rating * 10) - (distance * 5) - (price * 0.2)

            scored_spaces.append({
                'id': space.get('id'),
                'distance_km': round(distance, 2),
                'score': round(score, 2),
                'price': price,
                'rating': rating,
                'available_slots': available
            })

        # Sort recommendations by score descending
        scored_spaces.sort(key=lambda x: x['score'], reverse=True)

        return JsonResponse({
            'success': True,
            'message': 'Smart recommendations generated successfully',
            'recommendations': scored_spaces
        })
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)}, status=400)
