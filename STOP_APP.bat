@echo off
echo ========================================
echo   Stopping Household Expenses App
echo ========================================
echo.

echo Stopping servers on ports 3000 and 3001...

REM Kill processes on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping frontend server (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill processes on port 3001 (Backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo Stopping backend server (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All servers stopped!
echo.
pause

