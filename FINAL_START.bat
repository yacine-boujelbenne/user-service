@echo off
title Microservices Launcher
color 0A

echo ==================================================
echo       LAUNCHING ALL MICROSERVICES (Full Stack)
echo ==================================================
echo.

echo 0. Cleaning up environment...
taskkill /F /IM node.exe >nul 2>&1
echo Killing processes on microservice ports...
for %%p in (5000, 5001, 5002, 6000, 4000, 8081) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "LISTENING LISTENING" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
    @rem Fallback for French Windows
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "ÉCOUTE" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
)
timeout /t 2 >nul

echo 1. Starting User Service (Port 5000)...
start "User Service" cmd /k "cd /d "%~dp0userservie" && title User Service (5000) && npm run devStart"
timeout /t 2 >nul

echo 2. Starting Post Service (Port 5001)...
start "Post Service" cmd /k "cd /d "%~dp0post-service" && title Post Service (5001) && npm run devStart"
timeout /t 2 >nul

echo 3. Starting Comment Service (Port 5002)...
start "Comment Service" cmd /k "cd /d "%~dp0comment-service" && title Comment Service (5002) && npm run devStart"
timeout /t 2 >nul

echo 4. Starting API Gateway (Port 4000)...
start "API Gateway" cmd /k "cd /d "%~dp0gateway" && title API Gateway (4000) && npm run devStart"
echo Waiting for Gateway to initialize...
timeout /t 5 >nul

echo 5. Starting Frontend (Port 8081)...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && title Frontend (8081) && node server.js"
timeout /t 4 >nul

echo.
echo ==================================================
echo       ALL SERVICES LAUNCHED!
echo ==================================================
echo.
echo Opening: http://localhost:8081
echo.
start "" "http://localhost:8081"
pause
exit
