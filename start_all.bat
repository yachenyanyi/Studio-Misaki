@echo off
echo ===================================================
echo   Sakura AI Startup Script (Windows)
echo ===================================================

:: 1. Start Django Backend (Port 8000)
echo [1/3] Starting Django Backend...
start "Django Backend" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

:: 2. Start Chainlit App (Port 8001)
echo [2/3] Starting Chainlit App...
start "Chainlit Service" cmd /k "cd chainlit_app && chainlit run app.py -w --port 8001"

:: 3. Start Frontend (Port 5173)
echo [3/3] Starting React Frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   All services are starting in new windows.
echo   - Backend:  http://localhost:8000
echo   - Chainlit: http://localhost:8001
echo   - Frontend: http://localhost:5173
echo ===================================================
echo.
pause
