#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}   Sistema de Préstamo - Tuniche${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""

# Verificar que PHP esté instalado
echo -e "[1/4] Verificando dependencias..."
if ! command -v php &> /dev/null; then
    echo -e "${RED}⚠ PHP no está instalado${NC}"
    echo "Por favor instala PHP 7.4 o superior"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}⚠ Node.js no está instalado${NC}"
    echo "Por favor instala Node.js 16 o superior"
    exit 1
fi

echo -e "${GREEN}✓ Dependencias verificadas${NC}"
echo ""

# Iniciar servidor PHP en background
echo -e "[2/4] Iniciando servidor PHP..."
cd backend
php -S localhost:8012 > /dev/null 2>&1 &
PHP_PID=$!
cd ..
echo -e "${GREEN}✓ Servidor PHP iniciado (PID: $PHP_PID)${NC}"
echo ""

# Navegar al frontend
echo -e "[3/4] Preparando frontend..."
cd frontend

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de Node.js..."
    npm install
fi

echo -e "${GREEN}✓ Frontend preparado${NC}"
echo ""

# Función para cleanup al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}Deteniendo servidores...${NC}"
    kill $PHP_PID 2> /dev/null
    echo -e "${GREEN}✓ Servidores detenidos${NC}"
    exit 0
}

trap cleanup EXIT INT TERM

# Iniciar servidor de desarrollo
echo -e "[4/4] Iniciando servidor de desarrollo..."
echo ""
echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}   Accede a la aplicación en:${NC}"
echo -e "${CYAN}   http://localhost:3000${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
echo -e "Backend API: ${YELLOW}http://localhost:8012${NC}"
echo ""
echo -e "Presiona ${YELLOW}Ctrl+C${NC} para detener los servidores"
echo ""

npm run dev
