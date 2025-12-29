@echo off
echo ========================================
echo Starting Frontend Dev Server
echo ========================================
echo.
echo Server will start at: http://localhost:3000
echo.
echo Wait for: "Ready in 3s"
echo Then test these URLs:
echo.
echo 1. http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule-test
echo 2. http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule-simple  
echo 3. http://localhost:3000/dashboard/projects/eee0e120-d6cf-4afa-96c6-2c1cfbda5249/schedule
echo.
echo ========================================
echo.

cd /d E:\Project\epc\frontend

npm run dev
