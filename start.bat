@echo off
chcp 65001 > nul
cls
echo ====================================
echo   Sistema de Préstamo - Tuniche
echo ====================================
echo.

REM Verificar que XAMPP esté ejecutándose
echo [1/3] Verificando servicios...
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo.
    echo ⚠ XAMPP Apache no está ejecutándose
    echo Por favor inicia XAMPP Control Panel y arranca Apache
    echo Presiona cualquier tecla después de iniciar Apache...
    pause > nul
)

REM Verificar que MySQL esté ejecutándose
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo.
    echo ⚠ MySQL no está ejecutándose
    echo Por favor inicia MySQL desde XAMPP Control Panel
    echo Presiona cualquier tecla después de iniciar MySQL...
    pause > nul
)

echo ✓ Servicios verificados
echo.

REM Navegar a la carpeta del frontend
echo [2/3] Preparando frontend...
cd frontend

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    call npm install
)

echo ✓ Frontend preparado
echo.

REM Iniciar el servidor de desarrollo
echo [3/3] Iniciando servidor de desarrollo...
echo.
echo ====================================
echo   Accede a la aplicación en:
echo   http://localhost:3000
echo ====================================
echo.
echo Backend API: http://localhost:8012
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev
