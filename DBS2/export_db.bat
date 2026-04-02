@echo off
:: Vytvoří zálohu (dump) databáze mma_club_db z běžícího Docker kontejneru.
:: Výsledný soubor dump.sql se uloží do stejné složky jako tento skript (DBS2/).
::
:: Použití:  Spusť dvojklikem nebo z příkazové řádky: .\export_db.bat
:: Požadavek: Musí běžet Docker kontejner 'dbs2_postgres' (docker compose up -d)

echo ================================================
echo  Zaloha databaze mma_club_db
echo ================================================

docker exec dbs2_postgres pg_dump -U admin_dbs2 mma_club_db > "%~dp0dump.sql"

if %ERRORLEVEL% == 0 (
    echo  Hotovo! Dump ulozen jako: %~dp0dump.sql
) else (
    echo  CHYBA: dump se nezdaril. Je spusteny kontejner dbs2_postgres?
    echo  Zkus: docker compose up -d
)

echo ================================================
pause
