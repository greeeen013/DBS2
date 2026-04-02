@echo off
chcp 65001 >nul
title Pretorian MMA – Backend Server

echo.
echo  ==========================================
echo   Pretorian MMA – Backend API
echo   http://localhost:8000
echo   http://localhost:8000/docs  (Swagger UI)
echo  ==========================================
echo.

cd /d "%~dp0"

:: Kontrola zda je uvicorn dostupny
where uvicorn >nul 2>&1
if errorlevel 1 (
    echo [CHYBA] uvicorn nenalezen. Instaluji zavislosti...
    pip install -r requirements.txt
    echo.
)

echo Spoustim server... (Ctrl+C pro zastaveni)
echo.

uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause