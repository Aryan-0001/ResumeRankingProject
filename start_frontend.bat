@echo off
cd /d "%~dp0frontend"
echo Starting Frontend Server...
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo.
  echo Node.js/npm was not found on this PC.
  echo Install Node.js 18+ from https://nodejs.org/ or with: winget install OpenJS.NodeJS.LTS
  echo Then reopen this terminal and run this script again.
  pause
  exit /b 1
)

npm install
npm run dev -- --host 0.0.0.0 --port 5173
pause
