@echo off
setlocal EnableDelayedExpansion

:: ================================================================
::  K-CONNECT  -  NSSM Windows Service Manager
::  Usage:  services.bat [install|start|stop|restart|status|remove]
::  Default action: install
::  Run as Administrator.
:: ================================================================

:: ---- Paths ------------------------------------------------------
set ROOT=C:\Relisant\KConnect\kconnect
set BACKEND_DIR=%ROOT%\backend
set FRONTEND_DIR=%ROOT%\frontend
set LOGS_DIR=%ROOT%\logs

set PYTHON=C:\Users\Administrator\AppData\Local\Programs\Python\Python313\python.exe
set NODE=C:\Program Files\nodejs\node.exe
set NSSM=C:\Windows\System32\nssm.exe

set BACKEND_SVC=KConnect-Backend
set FRONTEND_SVC=KConnect-Frontend
set BACKEND_PORT=5500
set FRONTEND_PORT=4400

:: ---- Parse action -----------------------------------------------
set ACTION=%~1
if "%ACTION%"=="" set ACTION=install

if /i "%ACTION%"=="install" goto :install
if /i "%ACTION%"=="start"   goto :start
if /i "%ACTION%"=="stop"    goto :stop
if /i "%ACTION%"=="restart" goto :restart
if /i "%ACTION%"=="status"  goto :status
if /i "%ACTION%"=="remove"  goto :remove

echo [ERROR] Unknown action "%ACTION%"
echo Usage: services.bat [install^|start^|stop^|restart^|status^|remove]
exit /b 1

:: ================================================================
:install
echo.
echo  K-CONNECT Service Installer
echo  ============================

:: Must run as Administrator
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Please right-click and "Run as Administrator".
    pause
    exit /b 1
)

:: Verify prerequisites
if not exist "%PYTHON%" (
    echo [ERROR] Python not found:  %PYTHON%
    exit /b 1
)
if not exist "%NODE%" (
    echo [ERROR] Node.js not found: %NODE%
    exit /b 1
)
if not exist "%NSSM%" (
    echo [ERROR] NSSM not found:    %NSSM%
    echo         Download nssm.exe from https://nssm.cc/download
    exit /b 1
)
if not exist "%FRONTEND_DIR%\node_modules\vite\bin\vite.js" (
    echo [ERROR] Vite not installed. Run:
    echo           cd "%FRONTEND_DIR%" ^&^& npm install
    exit /b 1
)

:: Create logs directory
if not exist "%LOGS_DIR%" (
    mkdir "%LOGS_DIR%"
    echo [OK] Created: %LOGS_DIR%
)

:: ---- Remove any existing installations --------------------------
echo.
echo [*] Removing old services if present...
"%NSSM%" stop   "%BACKEND_SVC%"  2>nul
"%NSSM%" stop   "%FRONTEND_SVC%" 2>nul
timeout /t 2 /nobreak >nul
"%NSSM%" remove "%BACKEND_SVC%"  confirm 2>nul
"%NSSM%" remove "%FRONTEND_SVC%" confirm 2>nul

:: ---- Backend service (Uvicorn) ----------------------------------
echo.
echo [*] Installing %BACKEND_SVC% ...
"%NSSM%" install "%BACKEND_SVC%" "%PYTHON%"
if errorlevel 1 (
    echo [ERROR] Failed to install %BACKEND_SVC%
    exit /b 1
)
"%NSSM%" set "%BACKEND_SVC%" AppParameters               "-m uvicorn app.main:app --host 0.0.0.0 --port %BACKEND_PORT%"
"%NSSM%" set "%BACKEND_SVC%" AppDirectory                "%BACKEND_DIR%"
"%NSSM%" set "%BACKEND_SVC%" AppStdout                   "%LOGS_DIR%\backend.log"
"%NSSM%" set "%BACKEND_SVC%" AppStderr                   "%LOGS_DIR%\backend-error.log"
"%NSSM%" set "%BACKEND_SVC%" AppStdoutCreationDisposition 4
"%NSSM%" set "%BACKEND_SVC%" AppStderrCreationDisposition 4
"%NSSM%" set "%BACKEND_SVC%" AppRotateFiles               1
"%NSSM%" set "%BACKEND_SVC%" AppRotateBytes               5242880
"%NSSM%" set "%BACKEND_SVC%" AppRestartDelay              3000
"%NSSM%" set "%BACKEND_SVC%" DisplayName                 "K-CONNECT Backend (Uvicorn :%BACKEND_PORT%)"
"%NSSM%" set "%BACKEND_SVC%" Description                 "K-CONNECT FastAPI backend served by Uvicorn on port %BACKEND_PORT%"
"%NSSM%" set "%BACKEND_SVC%" Start                        SERVICE_AUTO_START
echo [OK] %BACKEND_SVC% installed.

:: ---- Frontend service (Vite dev server) -------------------------
echo.
echo [*] Installing %FRONTEND_SVC% ...
"%NSSM%" install "%FRONTEND_SVC%" "%NODE%"
if errorlevel 1 (
    echo [ERROR] Failed to install %FRONTEND_SVC%
    exit /b 1
)
"%NSSM%" set "%FRONTEND_SVC%" AppParameters               "node_modules\vite\bin\vite.js --host 0.0.0.0 --port %FRONTEND_PORT% --strictPort"
"%NSSM%" set "%FRONTEND_SVC%" AppDirectory                "%FRONTEND_DIR%"
"%NSSM%" set "%FRONTEND_SVC%" AppStdout                   "%LOGS_DIR%\frontend.log"
"%NSSM%" set "%FRONTEND_SVC%" AppStderr                   "%LOGS_DIR%\frontend-error.log"
"%NSSM%" set "%FRONTEND_SVC%" AppStdoutCreationDisposition 4
"%NSSM%" set "%FRONTEND_SVC%" AppStderrCreationDisposition 4
"%NSSM%" set "%FRONTEND_SVC%" AppRotateFiles               1
"%NSSM%" set "%FRONTEND_SVC%" AppRotateBytes               5242880
"%NSSM%" set "%FRONTEND_SVC%" AppRestartDelay              3000
"%NSSM%" set "%FRONTEND_SVC%" DisplayName                 "K-CONNECT Frontend (Vite :%FRONTEND_PORT%)"
"%NSSM%" set "%FRONTEND_SVC%" Description                 "K-CONNECT React frontend served by Vite dev server on port %FRONTEND_PORT%"
"%NSSM%" set "%FRONTEND_SVC%" Start                        SERVICE_AUTO_START
echo [OK] %FRONTEND_SVC% installed.

:: ---- Start both -------------------------------------------------
echo.
echo [*] Starting %BACKEND_SVC% ...
"%NSSM%" start "%BACKEND_SVC%"

echo [*] Waiting 5 s for backend to initialise...
timeout /t 5 /nobreak >nul

echo [*] Starting %FRONTEND_SVC% ...
"%NSSM%" start "%FRONTEND_SVC%"

echo.
echo  ==============================================
echo   K-CONNECT services installed and started
echo  ==============================================
echo   Backend  : http://localhost:%BACKEND_PORT%
echo   API docs : http://localhost:%BACKEND_PORT%/docs
echo   Frontend : http://localhost:%FRONTEND_PORT%
echo              http://43.249.231.181:%FRONTEND_PORT%
echo   Logs     : %LOGS_DIR%
echo  ==============================================
echo.
echo   Other commands:
echo     services.bat status   -- show running state
echo     services.bat stop     -- stop both
echo     services.bat start    -- start both
echo     services.bat restart  -- restart both
echo     services.bat remove   -- uninstall both
echo.
goto :eof

:: ================================================================
:start
echo.
echo [*] Starting K-CONNECT services...
"%NSSM%" start "%BACKEND_SVC%"
echo [*] Waiting 4 s for backend...
timeout /t 4 /nobreak >nul
"%NSSM%" start "%FRONTEND_SVC%"
echo.
goto :status

:: ================================================================
:stop
echo.
echo [*] Stopping K-CONNECT services...
"%NSSM%" stop "%FRONTEND_SVC%"
"%NSSM%" stop "%BACKEND_SVC%"
echo [OK] Both services stopped.
goto :eof

:: ================================================================
:restart
echo.
echo [*] Restarting K-CONNECT services...
"%NSSM%" stop "%FRONTEND_SVC%"
"%NSSM%" stop "%BACKEND_SVC%"
timeout /t 3 /nobreak >nul
"%NSSM%" start "%BACKEND_SVC%"
echo [*] Waiting 4 s for backend...
timeout /t 4 /nobreak >nul
"%NSSM%" start "%FRONTEND_SVC%"
echo.
goto :status

:: ================================================================
:status
echo.
echo  K-CONNECT Service Status
echo  -------------------------
set /p =  %BACKEND_SVC%:  <nul
"%NSSM%" status "%BACKEND_SVC%"
set /p =  %FRONTEND_SVC%: <nul
"%NSSM%" status "%FRONTEND_SVC%"
echo.
goto :eof

:: ================================================================
:remove
echo.
echo [!] Removing K-CONNECT services...
"%NSSM%" stop   "%FRONTEND_SVC%" 2>nul
"%NSSM%" stop   "%BACKEND_SVC%"  2>nul
timeout /t 2 /nobreak >nul
"%NSSM%" remove "%FRONTEND_SVC%" confirm
"%NSSM%" remove "%BACKEND_SVC%"  confirm
echo [OK] Both services removed.
goto :eof
