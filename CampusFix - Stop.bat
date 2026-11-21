@echo off
title Stop CampusFix Server
echo Stopping CampusFix server on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
  taskkill /f /pid %%a >nul 2>&1
)
echo.
echo CampusFix server has been stopped.
timeout /t 2 >nul
