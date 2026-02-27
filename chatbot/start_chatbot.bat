@echo off
echo Starting MoneyMind AI Chatbot API...
cd /d "%~dp0"
python -m uvicorn main:app --host 0.0.0.0 --port 8004 --reload
pause
