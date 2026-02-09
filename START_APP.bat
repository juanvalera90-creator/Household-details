@echo off
echo ========================================
echo   Household Expenses - Starting App
echo ========================================
echo.

cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Starting Backend Server...
start "Household Expenses - Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/4] Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo [3/4] Starting Frontend Server...
start "Household Expenses - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo [4/4] Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   App is starting!
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Two windows have opened - keep them open while using the app.
echo Close this window when done.
echo.
pause

