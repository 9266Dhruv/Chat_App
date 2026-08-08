@echo off
echo ==============================================
echo  Shutting down Nexus Chat Application...
echo ==============================================

echo Killing Backend processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
taskkill /FI "WindowTitle eq Nexus Backend*" /T /F 2>nul

echo Killing Frontend processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
taskkill /FI "WindowTitle eq Nexus Frontend*" /T /F 2>nul

echo ==============================================
echo  All processes successfully terminated.
echo ==============================================
timeout /t 3 /nobreak >nul
