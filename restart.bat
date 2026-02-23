@echo off
echo --- Restarting InvoiceFlow ---
echo [1/2] Killing existing processes (3000, 5175, 5176, 5177)...
Powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -ErrorAction SilentlyContinue"
Powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5175).OwningProcess -ErrorAction SilentlyContinue"
Powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5176).OwningProcess -ErrorAction SilentlyContinue"
Powershell -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort 5177).OwningProcess -ErrorAction SilentlyContinue"

echo [2/2] Running fullstack workspace...
npm run fullstack
