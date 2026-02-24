@echo off
echo ========================================
echo MoneyMind AI - ML API Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Check if requirements are installed
echo Checking dependencies...
pip install -q -r requirements.txt

REM Check if models are trained
if not exist "expense_classifier.pkl" (
    echo.
    echo Models not found! Training models...
    echo This will take a few minutes...
    python train_all_models.py
)

REM Run setup check
echo.
echo Running setup check...
python check_setup.py

REM Start the API
echo.
echo ========================================
echo Starting ML API Server...
echo API will be available at: http://localhost:8000
echo API Docs at: http://localhost:8000/docs
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

python ml_api_v2.py
