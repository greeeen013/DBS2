import os
import psycopg2
from dotenv import load_dotenv

if __name__ == "__main__":
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
