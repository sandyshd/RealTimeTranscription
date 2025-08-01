@echo off
echo Starting Real-Time Transcription Development Server...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Trying Python server...
    goto :python_server
)

REM Check if http-server is installed
where http-server >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing http-server...
    npm install -g http-server
)

echo Starting server with Node.js http-server...
echo Open your browser and navigate to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
http-server -p 8000 -c-1 -o
goto :end

:python_server
REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Neither Node.js nor Python found!
    echo Please install Node.js or Python to run the development server.
    echo.
    echo Alternative: Use VS Code Live Server extension
    pause
    goto :end
)

echo Starting server with Python...
echo Open your browser and navigate to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000

:end
pause
