# DBS2 Projekt: Systém pro správu MMA klubu

Tento projekt slouží jako praktický výstup předmětu **DBS2**. Cílem je vytvoření komplexní databázové aplikace, která demonstruje znalost analýzy, modelování a implementace databázových systémů.

> 🏫 Tento projekt vznikl jako **semestrální práce** do předmětu **DBS2 – Databázové systémy II** na [Univerzitě Hradec Králové](https://www.uhk.cz) v rámci letního semestru.

## 📝 O projektu

Aplikace řeší **správu MMA klubu** a je určena pro trenéry, členy i administrátory.

### Hlavní funkcionality:
*   **Správa uživatelů:** Evidence uživatelů s různými úrovněmi oprávnění (člen, trenér, admin).
*   **Finance a Tarify:** Kompletní správa členství a plateb, včetně podpory slevových kódů a systému "první vstup zdarma".
*   **Rezervační systém:** Interaktivní rozvrh pro rezervaci:
    *   Skupinových tréninků (velké/malé lekce).
    *   Individuálních lekcí (1-na-1) s konkrétními trenéry.
    *   Automatická kontrola kapacitních limitů.
*   **Docházka:** Sledování reálné docházky a historie vstupů pro analýzu vytíženosti tělocvičny.

---

## 🎯 Zadání a kritéria splnění (Checklist)

Aplikace musí splňovat formální požadavky předmětu.

### 🗄️ Databáze (Backend)
- [ ] **M10+ Tabulek:** Datový model o rozsahu cca 10 tabulek.
- [ ] **Číselník:** Alespoň jeden číselník (např. typy lekcí, stavy plateb).
- [ ] **3x Pohled (View):** Minimálně tři pohledy využívané aplikací.
- [ ] **3x Funkce:** Alespoň tři uživatelské funkce různého typu.
- [ ] **3x Procedura:** Alespoň tři uložené procedury.
- [ ] **2x Trigger:** Alespoň dva databázové spouštěče.
- [ ] **1x Transakce:** Alespoň jedna transakce s ošetřeným `ROLLBACK` scénářem.
- [ ] **Indexy:** Použití indexů na neklíčové sloupce pro optimalizaci.
- [ ] **Kompozitní PK:** Využití kompozitních primárních klíčů.
- [ ] **JSON (Volitelné):** Práce s datovým typem JSON (pokud dává smysl).
- [ ] **Bezpečnost:** Aplikace se nepřipojuje jako `root`, ale má vlastního uživatele s omezenými právy.

### 💻 Aplikace (Frontend/Logic)
- [ ] **Role:** Systém využívají min. 2 role (např. Admin + Klient).
- [ ] **Formuláře:** Min. 2 plnohodnotné formuláře pro CRUD operace (vytváření/úprava dat) s validací.
- [ ] **Obrázky:** Funkcionalita pro nahrávání a zobrazování obrázků.
- [ ] **Technologie:** Vyšší programovací jazyk (C#, Java, PHP, Python...).
- [ ] **Git:** Verzování vývoje.
- [ ] **Docker (Doporučeno):** Nasazení pomocí `docker-compose`.

### 📄 Výstupy a hodnocení (Max 50 bodů)
*   **10b** - Databázový model a rozsah.
*   **10b** - Implementace databáze.
*   **10b** - Funkčnost aplikace.
*   **10b** - Prezentace (10-15 min) + individuální přínos.
*   **10b** - Dokumentace dle šablony:
    *   Uživatelská a Programová dokumentace (ERD, Analýza, Datový slovník).
    *   **Okomentované zdrojové kódy.**
    *   **Backup (export) databáze.**

---

## 🛠️ Použité technologie (Tech Stack)

*(Bude doplněno v průběhu vývoje)*

*   **Jazyk:** Python 3.12
*   **Databáze:** PostgreSQL 16
*   **Kontejnerizace:** Docker + Docker Compose
*   **Knihovny:** (bude upřesněno, např. psycopg2-binary, Flask/Django)
 
 ---
 
 ## 👥 Autoři projektu
 
 *   **Jan Pospíšil** - [GitHub](https://github.com/greeeen013)
 *   **Jiří Černák** - [GitHub](https://github.com/SlightlySaltedTeriyaki)
 *   **Dominik Hájek** - [GitHub](https://github.com/DominikHajek)
 
 ---

# 🛠️ Postup Práce

## 📅 1. Fáze: Rozjezd a Analýza (1.-2.týden)
Cíl: Mít funkční prostředí a schválený datový model.

### 1.1 Technické prostředí
- [x] Vytvořit `README.md` s kontextem.
- [x] Vytvořit `docker-compose.yml`.
- [x] **Rozchodit připojení k databázi** (ověřit funkčnost Admineru).
- [x] Vytvořit virtuální prostředí Pythonu (`venv`) a `requirements.txt`.

### 1.2 Datová analýza a Modelování (10b)
*Nutné pro konzultaci ve 3.-4. týdnu!*
- [ ] **ERD (Entity Relationship Diagram):** Navrhnout grafické schéma.
    - [ ] Identifikovat entity (Člen, Trenér, Tarif, Platba, Trénink, Rezervace, Docházka...).
    - [ ] Definovat vztahy (kardinality 1:N, M:N).
- [ ] **Logický model:** Přepsat ERD do tabulek a atributů.
    - [ ] Zajistit 3. normální formu (3NF).
    - [ ] Navrhnout kompozitní klíče (dle zadání).
- [ ] **Skript pro vytvoření DB (`init.sql`):**
    - [ ] Napsat DDL příkazy (`CREATE TABLE`).
    - [ ] Přidat integritní omezení (PK, FK, NOT NULL, CHECK).

---

## 🔨 2. Fáze: Implementace Databáze (Backend) (10b)
Cíl: Naplnit DB daty a naprogramovat logiku.

### 2.1 Struktura a Data
- [ ] Spustit `init.sql` a vytvořit tabulky (cca 10+).
- [ ] Vytvořit **číselníky** (např. typ lekce: MMA, Box, BJJ).
- [ ] Připravit testovací data (Mock Data) a nahrát je do tabulek.

### 2.2 Programovatelné objekty (Nutné splnit počty!)
- [ ] **3x Pohled (View):**
    - [ ] 1. Pohled: Přehled dlužníků (Kdo nezaplatil členství).
    - [ ] 2. Pohled: Rozvrh na aktuální týden s kapacitou.
    - [ ] 3. Pohled: Statistiky návštěvnosti trenérů.
- [ ] **3x Funkce (Function):**
    - [ ] 1. Výpočet aktuální ceny tarifu (se slevou).
    - [ ] 2. Kontrola volné kapacity lekce (vrací True/False).
    - [ ] 3. Získání detailů člena jako JSON.
- [ ] **3x Procedura (Stored Procedure):**
    - [ ] 1. Vytvoření nové rezervace (s kontrolou kreditu).
    - [ ] 2. Uzavření měsíčního vyúčtování.
    - [ ] 3. Archivace neaktivních členů.
- [ ] **2x Trigger:**
    - [ ] 1. Logování změn v uživatelském profilu (History tabulka).
    - [ ] 2. Automatické snížení kreditu po rezervaci.
- [ ] **1x Transakce:**
    - [ ] Platba členství (Vytvoření záznamu o platbě + prodloužení platnosti tarifu v jedné transakci).

---

## 💻 3. Fáze: Vývoj Aplikace (Frontend/Logic) (10b)
Cíl: Vytvořit GUI pro uživatele.

### 3.1 Základ aplikace
- [ ] Vybrat framework (navrhuji **Flask** nebo **FastAPI** pro jednoduchost, případně **Django**).
- [ ] Vytvořit strukturu projektu.
- [ ] Připojení k DB z Pythonu (driver `psycopg`).

### 3.2 Implementace formulářů a rolí
- [ ] **Login systém:** Rozlišení rolí (Admin, Trenér, Člen).
- [ ] **Formulář 1 (Admin/Trenér):** Správa tréninků (CRUD - Přidat, Upravit, Smazat lekci).
- [ ] **Formulář 2 (Člen):** Rezervační formulář (Výběr lekce -> Potvrzení).
- [ ] Zobrazení dat z Pohledů (např. "Můj rozvrh").
- [ ] Nahrávání profilových obrázků.

> ℹ️ **Poznámka k UI a frontendové analýze:** 
> Podrobná charakteristika uživatelského rozhraní, rozpad jednotlivých rolí v aplikaci (Member, Trainer, Guest) a přesné vymezení povolených akcí, ze kterých budou vycházet aplikační formuláře, jsou detailně zpracovány v rámci naší paralelní semestrální práce. **Kompletní specifikaci UI a frontendové architektury naleznete v souboru [TNPW2/README.md](../TNPW2/README.md).**

---

## 📚 4. Fáze: Dokumentace a Finalizace (10b + 10b)
Cíl: Příprava na odevzdání.

- [ ] **Export (Backup) DB.**
- [ ] Generování dokumentace ze schématu.
- [ ] Sepsání Uživatelské příručky.
- [ ] Příprava prezentace.
- [ ] Final code review a komentáře v kódu.
