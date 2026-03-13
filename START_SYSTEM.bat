@echo off
REM WFC Gym Management System - Quick Start Script for Windows

echo.
echo ==========================================
echo  WFC - Wolverine Fitness Club
echo  System Startup Script
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
node --version

REM Check if MongoDB is installed
mongosh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB might not be running!
    echo Make sure MongoDB service is started.
)

echo.
echo Starting WFC Gym Management System...
echo.

REM Start Backend
echo [1/2] Starting Backend Server...
cd wfc-software-backend-main
call npm install >nul 2>&1
start cmd /k "npm run dev"
echo ✓ Backend server started in new window (Port 5000)

REM Wait a bit for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo [2/2] Starting Frontend Server...
cd ..\wfc-software-frontend-main
call npm install >nul 2>&1
start cmd /k "npm run dev"
echo ✓ Frontend server started in new window (Port 5173)

echo.
echo ==========================================
echo ✓ WFC System is Starting!
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:5000
echo.
echo Login with your credentials or register new account
echo ==========================================
echo.
pause
