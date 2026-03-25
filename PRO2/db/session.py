# Konfigurace databázového připojení – vytvoření engine a session factory.
#
# Použití env proměnné DATABASE_URL zajišťuje, že nemusíme hardcodovat
# přihlašovací údaje přímo do kódu (bezpečnější, snazší přepnutí prostředí).
# Fallback hodnota odpovídá nastavení v DBS2/docker-compose.yml.

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# URL k databázi – ve výchozím stavu bere hodnotu z env, jinak použije dev DB z docker-compose.
# Formát: postgresql+psycopg2://uživatel:heslo@host:port/databáze
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://admin_dbs2:password123@localhost:5432/mma_club_db",
)

# Engine je sdílené spojení s databází – SQLAlchemy ho drží jako connection pool.
# echo=False v produkci; pro ladění lze přepnout na True (vypisuje SQL příkazy).
engine = create_engine(
    DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Ověří připojení před každým použitím – odolnost vůči výpadku DB.
)

# SessionLocal je továrna na databázové sessions.
# autocommit=False -> každou transakci musíme potvrdit ručně (bezpečnější).
# autoflush=False  -> SQLAlchemy neposílá změny do DB automaticky před každým dotazem.
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
)
