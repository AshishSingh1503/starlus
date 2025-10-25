@echo off
echo Starting Starlus Learning Platform in Development Mode...
echo.

echo Setting up Backend...
cd backend
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo Please edit backend/.env with your configuration
    pause
)

echo Installing backend dependencies...
call npm install

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo Setting up Frontend...
cd ../frontend
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo Please edit frontend/.env with your configuration
    pause
)

echo Installing frontend dependencies...
call npm install

echo.
echo Starting Frontend Development Server...
start "Frontend Server" cmd /k "npm start"

echo.
echo Development servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul