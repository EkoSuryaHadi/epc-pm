@echo off
echo ========================================
echo RESTARTING EPC SERVERS - CLEAN STATE
echo ========================================
echo.
echo This will start both Backend and Frontend servers
echo in separate windows with clean cache.
echo.
echo Press any key to continue...
pause > nul

echo.
echo Starting Backend Server (Port 3001)...
start "EPC Backend" cmd /k "cd /d E:\Project\epc\backend && npm run dev"
timeout /t 5 /nobreak > nul

echo Starting Frontend Server (Port 3000)...
start "EPC Frontend" cmd /k "cd /d E:\Project\epc\frontend && npm run dev"

echo.
echo ========================================
echo SERVERS STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Wait 15-20 seconds for frontend to compile, then:
echo Open browser to: http://localhost:3000/login
echo.
echo Keep both terminal windows open!
echo.
pause
