@echo off
echo ==============================================
echo  Starting Nexus Chat Application (Presentation)
echo ==============================================

echo [1/3] Cleaning up any ghost processes from previous runs...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Starting Java Spring Boot Backend...
cd backend
start "Nexus Backend" cmd /k "title Nexus Backend (DO NOT CLOSE) && mvn spring-boot:run"
cd ..

echo [3/3] Starting React Frontend...
cd frontend
start "Nexus Frontend" cmd /k "title Nexus Frontend (DO NOT CLOSE) && npm run dev"
cd ..

echo ==============================================
echo  All systems booting! 
echo  The frontend will automatically open in your browser.
echo  To shut everything down cleanly, run STOP.bat
echo ==============================================
timeout /t 5 /nobreak >nul
