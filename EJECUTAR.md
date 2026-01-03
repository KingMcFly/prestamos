# 🚀 Guía de Ejecución - Sistema de Préstamo Tuniche

Esta guía te ayudará a ejecutar la aplicación fácilmente usando los archivos ejecutables incluidos.

## 📋 Requisitos Previos

### Para Windows:
- ✅ XAMPP instalado (con Apache y MySQL)
- ✅ Node.js 16 o superior
- ✅ Git (opcional)

### Para Linux/Mac:
- ✅ PHP 7.4 o superior
- ✅ MySQL/MariaDB
- ✅ Node.js 16 o superior

---

## 🪟 Ejecución en Windows

### Opción 1: Doble clic (Recomendado)
1. Asegúrate de que **XAMPP Control Panel** esté abierto
2. **Inicia Apache** y **MySQL** desde XAMPP
3. Haz **doble clic** en el archivo `start.bat`
4. Espera a que se abra el navegador automáticamente
5. ¡Listo! La aplicación está corriendo en http://localhost:3000

### Opción 2: Línea de comandos
```cmd
start.bat
```

### 🔥 Abrir Puertos en el Firewall (Solo si usas otros dispositivos)
Si quieres acceder desde otros dispositivos en tu red local:

1. **Clic derecho** en `abrir-puertos.ps1`
2. Selecciona **"Ejecutar con PowerShell"**
3. Acepta los permisos de administrador
4. Los puertos 3000 y 8012 estarán abiertos

---

## 🐧 Ejecución en Linux/Mac

### En la terminal:
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x start.sh

# Ejecutar
./start.sh
```

El script automáticamente:
- ✅ Verifica las dependencias
- ✅ Inicia el servidor PHP en el puerto 8012
- ✅ Instala dependencias de Node.js (si es necesario)
- ✅ Inicia el servidor de desarrollo en el puerto 3000

---

## 🌐 Acceso a la Aplicación

Una vez iniciado, accede desde tu navegador:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación** | http://localhost:3000 | Frontend de la aplicación |
| **API Backend** | http://localhost:8012 | API PHP |

### Desde otros dispositivos en la red:
Reemplaza `localhost` con la IP de tu computadora:
```
http://192.168.1.XXX:3000
```

Para conocer tu IP:
- **Windows**: `ipconfig` en CMD
- **Linux/Mac**: `ifconfig` o `ip addr`

---

## ⚠️ Solución de Problemas

### "Puerto ya en uso"
Si el puerto 3000 o 8012 ya está en uso:
1. Cierra otras aplicaciones que puedan estar usando esos puertos
2. Reinicia XAMPP (Windows)
3. Ejecuta el script nuevamente

### "XAMPP Apache no está ejecutándose" (Windows)
1. Abre XAMPP Control Panel
2. Haz clic en **"Start"** junto a Apache
3. Haz clic en **"Start"** junto a MySQL
4. Ejecuta `start.bat` nuevamente

### "node_modules no encontrado"
El script instalará automáticamente las dependencias. Si hay un error:
```bash
cd frontend
npm install
cd ..
```

### Error de base de datos
1. Asegúrate de que MySQL esté corriendo
2. Importa el archivo `frontend/database.sql` en phpMyAdmin
3. Verifica la configuración en `backend/db.php`

---

## 🛑 Detener la Aplicación

Para detener los servidores:
- Presiona **Ctrl + C** en la terminal/consola
- En Windows, también puedes cerrar la ventana de comandos

---

## 📝 Notas Adicionales

- Los archivos ejecutables verifican automáticamente las dependencias
- No necesitas configuración adicional después de la primera ejecución
- Los logs se mostrarán en la terminal para debugging
- El modo desarrollo incluye hot-reload automático

---

## 💡 Comandos Manuales (Avanzado)

Si prefieres ejecutar manualmente:

### Backend (PHP):
```bash
cd backend
php -S localhost:8012
```

### Frontend (React + Vite):
```bash
cd frontend
npm install  # Solo la primera vez
npm run dev
```

---

¡Disfruta usando el Sistema de Préstamo Tuniche! 🎉

Para reportar problemas o contribuir, consulta la documentación del proyecto.
