@echo off
title Modular Monolith Launcher
color 0A
set "ROOT=%~dp0"

echo ==================================================
echo      LAUNCHING MODULAR MONOLITH (Full Stack)
echo ==================================================
echo.

echo 0. Cleaning up environment...
taskkill /F /IM node.exe >nul 2>&1
echo Killing processes on application ports...
for %%p in (4000, 8081) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%p" ^| findstr "LISTENING LISTENING" 2^>nul') do taskkill /f /pid %%a >nul 2>&1
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
        timeout /t 4 >nul
    ) else (
        echo WARNING: MongoDB not found at C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe
        echo          Install MongoDB or update FINAL_START.bat with your mongod path.
    )
) else (
    echo MongoDB is already running.
)

echo 1. Starting Modular Monolith API (Port 4000)...
start "Modular Monolith API" cmd /k "cd /d ""%ROOT%monolith"" && title Modular Monolith API (4000) && npm run devStart"
echo Waiting for API to initialize...
timeout /t 4 >nul

echo 2. Starting Frontend (Port 8081)...
start "Frontend" cmd /k "cd /d ""%ROOT%frontend"" && title Frontend (8081) && node server.js"
timeout /t 4 >nul

echo.
echo ==================================================
echo       APP LAUNCHED!
echo ==================================================
echo.
echo Opening: http://localhost:8081
echo.
start "" "http://localhost:8081"
pause
exit
