@echo off@echo off

echo 🚀 Demarrage du serveur de developpement FaithChronicles...taskkill /f /im node.exe >nul 2>&1

echo.timeout /t 1 /nobreak >nul

echo 📍 URL: http://localhost:3000npm start
echo 🔑 Supabase: Configure dans .env
echo.
npm start
