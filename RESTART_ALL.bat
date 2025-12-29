@echo off
echo ========================================
echo Restarting Backend and Frontend
echo ========================================
echo.
echo This will:
echo 1. Kill all node processes
echo 2. Start backend on port 3001
echo 3. Start frontend on port 3000
echo.
echo IMPORTANT: Close any terminals running npm run dev first!
echo.
pause

echo.
echo Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo Starting Backend...
echo ========================================
start "Backend Server" cmd /k "cd /d E:\Project\epc\backend && npm run start:dev"

echo Waiting for backend to start...
timeout /t 10 /nobreak

echo.
echo ========================================
echo Starting Frontend...
echo ========================================
start "Frontend Server" cmd /k "cd /d E:\Project\epc\frontend && npm run dev"

echo.
echo ========================================
echo Done!
echo ========================================
echo.
echo Backend: http://localhost:3001/api
echo Frontend: http://localhost:3000
echo.
echo Wait 30 seconds for both servers to be ready
echo Then open: http://localhost:3000
echo.
pause
