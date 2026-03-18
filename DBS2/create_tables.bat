@echo off
chcp 65001 >nul
echo =======================================================
echo        Vytváření tabulek z DDL.sql (DROP + CREATE)
echo =======================================================
echo.

python import_db.py
IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ CHYBA: import_db.py selhal!
    echo 💡 Ověř, zda běží Docker kontejner a máš správně nastavený .env soubor.
    echo    Případně nainstaluj závislosti: pip install psycopg2-binary python-dotenv
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Tabulky byly úspěšně vytvořeny!
echo.
pause
