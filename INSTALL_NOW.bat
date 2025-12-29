@echo off
echo ========================================
echo Installing Frontend Dependencies
echo ========================================
echo.
echo This will take 5-10 minutes...
echo Please wait until you see "added XXXX packages"
echo.

cd /d E:\Project\epc\frontend

echo Cleaning old files...
if exist node_modules rd /s /q node_modules
if exist .next rd /s /q .next

echo.
echo Installing packages...
echo.

npm install --legacy-peer-deps

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Now run: npm run dev
echo.
pause
