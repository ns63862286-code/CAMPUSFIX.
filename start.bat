@echo off
title CampusFix Server
color 0B

echo ==========================================================
echo        Starting CampusFix Platform...
echo ==========================================================
echo.

cd /d "%~dp0"

REM Ensure Node.js is available
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check if server is already running on port 3000
netstat -aon | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
  echo [Notice] CampusFix is already running on port 3000!
  echo Opening application in your browser...
  start http://localhost:3000
  timeout /t 3 >nul
  exit /b
)

echo [1/2] Launching web server on http://localhost:3000...
echo [2/2] Opening browser in 2 seconds...
echo.
echo Tip: Keep this window open while using CampusFix.
echo      To stop the server at any time, press Ctrl+C or close this window.
echo.

REM Automatically open browser
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

"C:\Program Files\nodejs\node.exe" server/index.js
pause
