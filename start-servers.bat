@echo off
echo.
echo ========================================
echo  Noblessa Partner Resources Setup
echo ========================================
echo.
echo Starting Authentication Server (Port 3000)...
start /b cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo Starting 11ty Development Server (Port 8080)...
start /b cmd /c "npm run watch:eleventy"

echo.
echo ========================================
echo  Servers Starting...
echo ========================================
echo.
echo 🔐 Authentication API: http://localhost:3000
echo 🌐 Website: http://localhost:8080
echo.
echo Visit: http://localhost:8080/partner-resources/
echo.
echo Press Ctrl+C to stop all servers
echo ========================================
echo.

timeout /t -1
