@echo off
echo ========================================
echo    Starlus - Quick Local Setup
echo ========================================
echo.

echo Cleaning up old installations...
cd backend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Installing Backend (this may take a moment)...
call npm install --legacy-peer-deps

echo.
echo Starting Backend Server...
start "Backend" cmd /k "node src/server.js"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

cd ../frontend
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Installing Frontend...
call npm install --legacy-peer-deps

echo.
echo Starting Frontend...
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   Setup Complete!
echo   
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo   
echo   Open: http://localhost:3001
echo ========================================
pause