# Hlavní vstupní bod FastAPI aplikace – Pretorian MMA management system.
#
# Tato implementace je základní stub pro IR01 – ověřuje, že DI a modely
# jsou správně napojeny. Konkrétní business routes přidají Studenti A a B
# v rámci dalších issues (IR02+).

from fastapi import FastAPI
from fastapi.responses import HTMLResponse

# Importem modelů zajistíme, že SQLAlchemy "vidí" všechny tabulky.
# To je nezbytné, pokud chceme použít Base.metadata.create_all() pro inicializaci DB.
from models import Base  # noqa: F401 – import potřebný pro side-effect (registrace tabulek)
from db.session import engine

# Vytvoření FastAPI aplikace s metadaty pro dokumentaci (Swagger UI na /docs).
app = FastAPI(
    title="Pretorian MMA – API",
    description="Backend API pro správu MMA klubu Pretorian (semestrální projekt PRO2/DBS2).",
    version="0.1.0",
)


@app.get("/", include_in_schema=False)
def index():
    """
    Úvodní stránka API – přesměruje vývojáře na Swagger dokumentaci.
    include_in_schema=False -> endpoint se nezobrazí v /docs (je jen orientační).
    """
    return HTMLResponse(content="""
    <html>
      <head><title>Pretorian MMA – API</title></head>
      <body style="font-family:sans-serif;padding:40px;background:#1a1a2e;color:#eee;">
        <h1>🥊 Pretorian MMA – Backend API</h1>
        <p>Server běží úspěšně.</p>
        <ul>
          <li><a href="/docs" style="color:#e94560;">/docs</a> – Swagger UI (interaktivní dokumentace)</li>
          <li><a href="/health" style="color:#e94560;">/health</a> – Health check</li>
        </ul>
        <p style="color:#888;font-size:0.85em;">PRO2 / DBS2 – semestrální projekt, IR01</p>
      </body>
    </html>
    """, status_code=200)


@app.get("/health", tags=["Infrastruktura"])
def health_check():
    """
    Zdravotní endpoint – ověří, že server běží.
    Neověřuje připojení k DB (to je záměr – DB může být dočasně nedostupná).
    """
    return {"status": "ok", "service": "Pretorian MMA API"}


# Spuštění přes příkazovou řádku:
#   uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
