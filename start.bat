@echo off
setlocal enabledelayedexpansion
title Rozgar Sarthi Launcher
cd /d "%~dp0"
cls

echo ============================================================
echo           Starting Rozgar Sarthi Application
echo ============================================================
echo.

:: 1. Check & Setup Backend
echo [*] Checking Backend environment...
cd /d "%~dp0backend\conversational-interview"

if not exist ".env" (
    if exist ".env.example" (
        echo [!] .env not found in backend. Copying from .env.example...
        copy ".env.example" ".env" >nul
        echo [!] Remember to configure your GOOGLE_API_KEY in backend\conversational-interview\.env
    )
)

set BACKEND_CMD=
if exist ".venv\Scripts\python.exe" (
    set BACKEND_CMD=call .venv\Scripts\activate.bat ^&^& python -m uvicorn api:app --reload --port 8000
) else (
    where uv >nul 2>nul
    if !errorlevel! equ 0 (
        echo [*] Syncing backend dependencies with uv...
        uv sync
        set BACKEND_CMD=uv run uvicorn api:app --reload --port 8000
    ) else (
        where python >nul 2>nul
        if !errorlevel! equ 0 (
            echo [*] Creating virtual environment...
            python -m venv .venv
            call .venv\Scripts\activate.bat
            pip install -r requirements.txt 2>nul || pip install -e .
            set BACKEND_CMD=call .venv\Scripts\activate.bat ^&^& python -m uvicorn api:app --reload --port 8000
        ) else (
            echo [ERROR] Python or uv not found! Please install Python 3.11+ or uv.
            pause
            exit /b 1
        )
    )
)

:: 2. Check & Setup Frontend
echo [*] Checking Frontend dependencies...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [*] Installing frontend dependencies (npm install)...
    call npm install
)

:: 3. Launch Backend in a new window
echo [*] Starting Backend server (FastAPI on port 8000)...
start "Rozgar Sarthi - Backend" cmd /k "cd /d "%~dp0backend\conversational-interview" && title Rozgar Sarthi Backend && echo Starting FastAPI Backend on http://localhost:8000... && %BACKEND_CMD%"

:: 4. Launch Frontend in a new window
echo [*] Starting Frontend server (Next.js on port 3000)...
start "Rozgar Sarthi - Frontend" cmd /k "cd /d "%~dp0frontend" && title Rozgar Sarthi Frontend && echo Starting Next.js Frontend on http://localhost:3000... && npm run dev"

:: 5. Open browser
cd /d "%~dp0"
echo [*] Waiting for services to initialize...
timeout /t 4 /nobreak >nul

echo [*] Opening application in browser...
start http://localhost:3000

echo.
echo ============================================================
echo   Rozgar Sarthi is now running!
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:8000
echo   API Docs : http://localhost:8000/docs
echo.
echo   (To stop the servers, simply close the respective
echo    Backend and Frontend terminal windows.)
echo ============================================================
echo.
echo Press any key to exit this launcher window...
pause >nul
