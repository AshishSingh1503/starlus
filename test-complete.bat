@echo off
echo ========================================
echo    Complete Login Test
echo ========================================
echo.

echo 1. Starting Debug Server...
start "Debug Server" cmd /k "node debug-server.js"

echo 2. Waiting for server to start...
timeout /t 3 /nobreak > nul

echo 3. Opening test page...
start http://localhost:3000/../quick-test.html

echo.
echo ========================================
echo   Test Instructions:
echo   1. Click "Check Server Health" first
echo   2. Click "Register Test User"  
echo   3. Click "Login Test User"
echo   
echo   If buttons don't work, check console
echo ========================================
pause