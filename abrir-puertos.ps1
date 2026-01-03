# Script para abrir los puertos necesarios en el Firewall de Windows
# IMPORTANTE: Debes ejecutar este script como ADMINISTRADOR
# Clic derecho en PowerShell -> "Ejecutar como administrador"

Write-Host "Abriendo puertos en el Firewall..." -ForegroundColor Cyan

# Puerto 8012 para XAMPP/Apache
New-NetFirewallRule -DisplayName "XAMPP Apache - Tuniche API" -Direction Inbound -Protocol TCP -LocalPort 8012 -Action Allow -ErrorAction SilentlyContinue
Write-Host "✓ Puerto 8012 (XAMPP) configurado" -ForegroundColor Green

# Puerto 3000 para Vite Dev Server
New-NetFirewallRule -DisplayName "Vite Dev Server - Tuniche" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction SilentlyContinue
Write-Host "✓ Puerto 3000 (Vite) configurado" -ForegroundColor Green

Write-Host "`nPuertos abiertos correctamente!" -ForegroundColor Green
Write-Host "Ahora puedes acceder desde otros dispositivos usando tu IP local" -ForegroundColor Yellow
pause
