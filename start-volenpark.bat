@echo off
echo Starting VolenPark Services...

echo Starting AI Service (Port 5001)...
start cmd /k "cd ai-service && call venv\Scripts\activate.bat && python manage.py runserver 5001"

echo Starting Backend (Port 5006)...
start cmd /k "cd backend && npm start"

echo Starting Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

echo All services are starting up in separate windows!
pause
