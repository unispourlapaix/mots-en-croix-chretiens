@echo off
echo 🚀 Demarrage du serveur avec Node.js - Mots En Croix Chretiens...
echo.

REM Vérifier si Node.js est installé
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installe!
    echo 📥 Telecharger sur: https://nodejs.org/
    pause
    exit /b
)

REM Tuer les processus Node existants
taskkill /f /im node.exe >nul 2>&1

echo 📍 URL: http://localhost:8000
echo 💡 Service Worker actif uniquement sur HTTPS ou localhost
echo 🎨 Design: Rose Kawaii - Mobile HD Portrait
echo 📱 Testez l'installation PWA!
echo.

REM Installer http-server si nécessaire
where http-server >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installation de http-server...
    call npm install -g http-server
)

REM Démarrer le serveur
cd /d "%~dp0"
http-server -p 8000 -c-1

pause
