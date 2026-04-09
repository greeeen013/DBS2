import os
import subprocess
import time
import psycopg2
from dotenv import load_dotenv

_DOCKER_DESKTOP_PATHS = [
    r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Docker\Docker\Docker Desktop.exe"),
]


def _docker_responsive() -> bool:
    try:
        r = subprocess.run(["docker", "info"], capture_output=True, timeout=5)
        return r.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def ensure_docker() -> bool:
    if _docker_responsive():
        return True

    print("⏳ Docker není spuštěn. Hledám Docker Desktop...")
    exe = next((p for p in _DOCKER_DESKTOP_PATHS if os.path.exists(p)), None)
    if exe is None:
        print("❌ Docker Desktop nenalezen. Nainstaluj ho a zkus znovu.")
        return False

    print(f"🚀 Spouštím: {exe}")
    subprocess.Popen([exe])

    print("⏳ Čekám na Docker", end="", flush=True)
    for _ in range(60):
        time.sleep(2)
        if _docker_responsive():
            print(" ✅")
            return True
        print(".", end="", flush=True)

    print("\n❌ Docker se nepodařilo spustit do 120 s.")
    return False


if __name__ == "__main__":
    if not ensure_docker():
        raise SystemExit(1)

    print("⏳ Připojování do PostgreSQL v Dockeru...")
    load_dotenv()

    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("❌ DATABASE_URL z .env nenalezena!")

    # Načtení DDL.sql ze stejné složky jako tento skript
    ddl_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "DDL.sql")
    with open(ddl_path, "r", encoding="utf-8") as f:
        ddl_sql = f.read().lower()

    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        print("🛠️  Spouštím DDL.sql (DROP + CREATE tabulek)...")
        cursor.execute(ddl_sql)

        cursor.close()
        conn.close()
        print("✅ Hotovo! Schéma databáze bylo úspěšně aplikováno.")

    except Exception as e:
        print(f"❌ Chyba: {e}")
        print("💡 Ověř, zda běží Docker kontejner a máš správně nastavený .env soubor.")
