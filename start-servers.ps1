# Noblessa Partner Resources Development Setup
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Noblessa Partner Resources Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Authentication Server (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host "Starting 11ty Development Server (Port 8080)..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "watch:eleventy" -WindowStyle Hidden

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Servers Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Authentication API: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Blue
Write-Host "🌐 Website: " -NoNewline
Write-Host "http://localhost:8082 (check console for actual port)" -ForegroundColor Blue
Write-Host ""
Write-Host "Visit: " -NoNewline
Write-Host "http://localhost:8082/partner-resources/" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press any key to open the website..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the website in default browser
Start-Process "http://localhost:8082/partner-resources/"

Write-Host ""
Write-Host "To stop servers, close this window or press Ctrl+C" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

# Keep the script running
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} catch {
    Write-Host "Shutting down..." -ForegroundColor Red
}
