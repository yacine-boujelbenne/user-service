@echo off
title SocialHub Microservices Launcher
color 0A
set "ROOT=%~dp0"

echo ==================================================
echo      LAUNCHING MICROSERVICES ARCHITECTURE
echo ==================================================
echo.

echo 0. Cleaning up environment...
taskkill /F /IM node.exe >nul 2>&1
echo Killing processes on application ports...
for %%p in (5000, 5001, 5002, 5003, 5004, 8081) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "LISTENING" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
    @rem Fallback for French Windows
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "ÉCOUTE" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
)
timeout /t 2 >nul

echo 0.1 Checking MongoDB (Port 27017)...
netstat -aon | findstr ":27017" | findstr "LISTENING" >nul
if errorlevel 1 (
    if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
        echo Starting MongoDB local instance...
        if not exist "C:\data\db" mkdir "C:\data\db" >nul 2>&1
        start "MongoDB" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "C:\data\db" --bind_ip 127.0.0.1 --port 27017
        timeout /t 3 >nul
    ) else (
        echo WARNING: MongoDB not found at C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe
        echo          Install MongoDB or update FINAL_START.bat with your mongod path.
    )
) else (
    echo MongoDB is already running.
)

echo 1. Starting API Gateway (Port 5000)...
start "API Gateway :5000" cmd /k "cd /d ""%ROOT%gateway"" && title API Gateway (5000) && npm install >nul 2>&1 && node server.js"
timeout /t 2 >nul

echo 2. Starting User Service (Port 5001)...
start "User Service :5001" cmd /k "cd /d ""%ROOT%userservie"" && title User Service (5001) && npm install >nul 2>&1 && node server.js"
timeout /t 2 >nul

echo 3. Starting Post Service (Port 5002)...
start "Post Service :5002" cmd /k "cd /d ""%ROOT%post-service"" && title Post Service (5002) && npm install >nul 2>&1 && node server.js"
timeout /t 2 >nul

echo 4. Starting Comment Service (Port 5003)...
start "Comment Service :5003" cmd /k "cd /d ""%ROOT%comment-service"" && title Comment Service (5003) && npm install >nul 2>&1 && node server.js"
timeout /t 2 >nul

echo 5. Starting Chat Service (Port 5004)...
start "Chat Service :5004" cmd /k "cd /d ""%ROOT%chat-service"" && title Chat Service (5004) && npm install >nul 2>&1 && node server.js"
timeout /t 2 >nul

echo 6. Starting Frontend (Port 8081)...
start "Frontend :8081" cmd /k "cd /d ""%ROOT%frontend"" && title Frontend (8081) && npm install >nul 2>&1 && node server.js"
timeout /t 3 >nul

echo.
echo ==================================================
echo       MICROSERVICES LAUNCHED!
echo ==================================================
echo.
echo Gateway:  http://127.0.0.1:5000
echo User:     http://127.0.0.1:5001
echo Post:     http://127.0.0.1:5002
echo Comment:  http://127.0.0.1:5003
echo Chat:     http://127.0.0.1:5004
echo Frontend: http://127.0.0.1:8081
echo.
echo Opening: http://localhost:8081
echo.
start "" "http://localhost:8081"
pause
exit
