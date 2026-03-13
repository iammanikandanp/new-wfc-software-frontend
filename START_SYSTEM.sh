#!/bin/bash

# WFC Gym Management System - Quick Start Script for Mac/Linux

echo ""
echo "=========================================="
echo "  WFC - Wolverine Fitness Club"
echo "  System Startup Script"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Check if MongoDB is running
if ! command -v mongosh &> /dev/null; then
    echo "WARNING: mongosh not found. MongoDB might not be running."
    echo "Make sure MongoDB is started: brew services start mongodb-community"
fi

echo ""
echo "Starting WFC Gym Management System..."
echo ""

# Start Backend
echo "[1/2] Starting Backend Server..."
cd wfc-software-backend-main
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo "✓ Backend server started (PID: $BACKEND_PID, Port 5000)"

# Wait for backend to start
sleep 3

# Start Frontend
echo "[2/2] Starting Frontend Server..."
cd ../wfc-software-frontend-main
npm install > /dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend server started (PID: $FRONTEND_PID, Port 5173)"

echo ""
echo "=========================================="
echo "✓ WFC System is Running!"
echo ""
echo "Frontend:  http://localhost:5173"
echo "Backend:   http://localhost:5000"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop the system, run:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Login with your credentials or register new account"
echo "=========================================="
echo ""

# Keep script running
wait
