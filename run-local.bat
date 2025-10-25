@echo off
echo ========================================
echo    Starlus Learning Platform - Local
echo ========================================
echo.

echo Installing Backend Dependencies...
cd backend
call npm install --silent

echo.
echo Starting Backend Server...
start "Starlus Backend" cmd /k "npm start"

timeout /t 3 /nobreak > nul

echo Installing Frontend Dependencies...
cd ../frontend
call npm install --silent

echo.
echo Starting Frontend Server...
start "Starlus Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   Servers Starting...
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:3001
echo   
echo   Wait for both servers to start
echo   then open: http://localhost:3001
echo ========================================
echo.
pause