# Real-Time Transcription Development Server Launcher
Write-Host "Starting Real-Time Transcription Development Server..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
if (Get-Command node -ErrorAction SilentlyContinue) {
    # Check if http-server is installed
    if (!(Get-Command http-server -ErrorAction SilentlyContinue)) {
        Write-Host "Installing http-server..." -ForegroundColor Yellow
        npm install -g http-server
    }
    
    Write-Host "Starting server with Node.js http-server..." -ForegroundColor Green
    Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    http-server -p 8000 -c-1 -o
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    Write-Host "Node.js not found. Starting server with Python..." -ForegroundColor Yellow
    Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    python -m http.server 8000
}
else {
    Write-Host "Neither Node.js nor Python found!" -ForegroundColor Red
    Write-Host "Please install Node.js or Python to run the development server." -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use VS Code Live Server extension" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
