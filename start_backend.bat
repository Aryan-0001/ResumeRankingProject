@echo off
cd /d "%~dp0backend"
echo Starting Backend Server...
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
