@echo off
echo ===================================================
echo   Studio-Misaki 一键启动脚本 (Windows)
echo ===================================================

:: 1. 启动 Django 后端 (端口 8000)
echo [1/2] 正在启动 Django Backend...
start "Django Backend" cmd /k "cd backend && python manage.py runserver 0.0.0.0:8000"

:: 2. 启动 React 前端 (端口 5173)
echo [2/2] 正在启动 React Frontend...
start "React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   所有服务已在新窗口中启动：
echo   - 后端接口:     http://localhost:8000
echo   - 前端站点:     http://localhost:5173
echo   - 前端聊天页:   http://localhost:5173/chat
echo ===================================================
echo.
pause
