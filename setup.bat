@echo off
REM KLPro Pvt Ltd - Quick Start Script for Windows

echo.
echo ================================
echo  KLPro Pvt Ltd - MERN Stack Setup
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Installing root dependencies...
call npm install

echo.
echo [2/5] Installing Server dependencies...
cd Server
call npm install
cd ..

echo.
echo [3/5] Installing Client dependencies...
cd Client
call npm install
cd ..

echo.
echo ================================
echo  Setup Complete!
echo ================================
echo.
echo To run the application:
echo.
echo Option 1 - Development Mode (requires 2 terminals):
echo   Terminal 1: cd Server && npm run dev
echo   Terminal 2: cd Client && npm start
echo.
echo Option 2 - Using concurrently (if installed):
echo   npm run dev
echo.
echo Option 3 - Server only:
echo   cd Server && npm start
echo.
echo ================================
echo.
echo NOTE: Make sure MongoDB is running on your system!
echo.
pause
