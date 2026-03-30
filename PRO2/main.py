# Hlavní vstupní bod FastAPI aplikace – Pretorian MMA management system.
#
# IR03: Přidány routery pro rezervace, platby a členy.
# CORSMiddleware povoluje přístupy z frontendu (localhost během vývoje).

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

# Import modelů zajišťuje, že SQLAlchemy "vidí" všechny tabulky.
from models import Base  # noqa: F401

from routers import members, payments, reservations

# Vytvoření FastAPI aplikace s metadaty pro dokumentaci (Swagger UI na /docs).
app = FastAPI(
    title="Pretorian MMA – API",
    description="Backend API pro správu MMA klubu Pretorian (semestrální projekt PRO2/DBS2).",
    version="0.2.0",
)

# CORS povolení pro frontend – při produkčním nasazení nahradit konkrétní doménou.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrace routerů – každý spravuje jeden okruh business logiky.
app.include_router(members.router)
app.include_router(reservations.router)
app.include_router(payments.router)


@app.get("/", include_in_schema=False)
def index():
    """Úvodní stránka API – přesměruje vývojáře na Swagger dokumentaci."""
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
        <p style="color:#888;font-size:0.85em;">PRO2 / DBS2 – semestrální projekt, IR03</p>
      </body>
    </html>
    """, status_code=200)


@app.get("/health", tags=["Infrastruktura"])
def health_check():
    """Zdravotní endpoint – ověří, že server běží."""
    return {"status": "ok", "service": "Pretorian MMA API", "verze": "0.2.0"}


# Spuštění přes příkazovou řádku:
#   uvicorn main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
