@echo off
echo ========================================
echo    Starlus - Simple Local Setup
echo ========================================
echo.

echo Starting Backend...
cd backend
start "Backend" cmd /k "node src/server.js"

echo Waiting for backend...
timeout /t 3 /nobreak > nul

echo Starting Simple Frontend...
cd ../simple-frontend
call npm install
start "Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   Servers Starting...
echo   
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo   
echo   Open: http://localhost:3001
echo ========================================
pause