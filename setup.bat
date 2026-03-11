@echo off
REM Setup script for Windows

echo 🚀 Setting up AI Jewellery Recommendation System...
echo.

REM Backend Setup
echo 📦 Setting up backend...
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Backend setup failed
    exit /b 1
)
echo ✓ Backend dependencies installed
cd ..

REM Frontend Setup
echo 📦 Setting up frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend setup failed
    exit /b 1
)
echo ✓ Frontend dependencies installed
cd ..

echo.
echo ✅ Setup complete!
echo.
echo 🚀 To start the app:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   uvicorn main:app --reload
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo.
echo Then open http://localhost:5173 in your browser
echo.
pause
