@echo off
chcp 65001 >nul
echo =======================================================
echo        Spouštění Docker kontejneru (PostgreSQL + Adminer)
echo =======================================================
echo.

docker compose up -d
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ CHYBA: Docker kontejner se nepodařilo spustit!
    echo 💡 Zapněte Docker Desktop a spusťte skript znovu.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Kontejnery běží!
echo 🌐 Adminer: http://localhost:8080
echo.
pause
