# Household Expenses - Stop Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stopping Household Expenses App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Stopping servers on ports 3000 and 3001..." -ForegroundColor Yellow

# Stop Frontend (port 3000)
$frontendProcesses = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $frontendProcesses) {
    Write-Host "Stopping frontend server (PID: $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

# Stop Backend (port 3001)
$backendProcesses = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique
foreach ($processId in $backendProcesses) {
    Write-Host "Stopping backend server (PID: $processId)..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "All servers stopped!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close"

