# Gym Management System - Pretorian

Tento projekt je spojením tří předmětů: **Databázové systémy II**, **Programování II** a **Technologie pro publikování na Webu II**. Vznikl na [Univerzitě Hradec Králové](https://www.uhk.cz) v rámci letního semestru.

> 💡 **Další informace k jednotlivým předmětům** naleznete ve specifických `README.md` souborech v příslušných složkách:
> - `DBS2/` (Zaměření na návrh struktury relační databáze)
> - `PRO2/` (Zaměření na backendovou logiku s využitím ORM a DI/IoC)
> - `TNPW2/` (Zaměření na frontend)

---

## O čem projekt je

Tento projekt tvoří **komplexní webovou aplikaci pro sportovní klub** (konkrétně zaměřeno pro MMA klub Pretorian). Systém slouží pro efektivní správu členů, evidenci jejich plateb, rezervační systém tréninků a kontrolu docházky. Důraz je u tohoto projektu kladen na to, aby šlo o rozšiřitelnou a modulární aplikaci, připravenou zvládnout budoucí provoz.

### Klíčové funkce a moduly

1. **Správa členů a registrace:**
   - Kdokoliv se může zaregistrovat ve webové aplikaci do systému.
   - Uživatelé si vytvoří profil (s možností přidat fotografii a doplněním osobních údajů). Uživatel následně může například zažádat o první vstupy do klubu zdarma.
   - Každý uživatel na svém profilu vidí aktuální kreditový zůstatek, jaké má platné tarify (permice) a svou osobní historii plateb a vstupů.

2. **Platební systém a tarify:**
   - Možnost zakoupení členských tarifů, které přidávají měsíční platnosti vstupu.
   - Funkce na automatické kupování/obnovení tarifu, pokud aktuální vyprší a uživatel má dostatečný zůstatek kreditů.
   - Přebírání dat z plateb - párování částky podle variabilního symbolu na konkrétního uživatele a připisování kreditů. Systém dbá na bezpečnost a důkladně operace loguje s možností dohledání.

3. **Rezervační systém:**
   - Trenéři mohou tvořit a spravovat tréninky (název, datum, čas konání, délka trvání a omezený počet míst). Mohou pro snadnější práci využít šablony (např. 10 minut rozcvička, 20 minut technika, 10 minut sparing atd.).
   - Členové se do limitu přes aplikaci k tréninku přihlašují.
   - Možnosti trenéra manuálně trénink stornovat nebo odhlásit konkrétního člena.

4. **Robustní logování aktivity:**
   - Záznam naprosto veškeré historické aktivity: přesný čas návštěvy a opuštění gymu, jakého tréninku se člen zúčastnil, jaké tarify zakoupil, přehled všech transakcí a dobití účtu daného klienta pro dohledatelnost čehokoliv.

5. **Uživatelské role:**
   - **Člen** - Má svůj profil, dobíjí si kredity, řídí své tarify a registruje se na tréninky.
   - **Trenér** - Vytváří a ruší tréninky, má přehled o svých lekcích a přihlášených cvičencích.
   - **Recepce** - Možnost spravovat návštěvníky, ale bez pokročilých modifikací systému (cenotvorba apod.).
   - **Admin** - Nejvyšší role pro kompletní správu všech částí klubu a kontrolních mechanizmů.

## Spuštění projektu

### Backend (FastAPI)
```bash
cd PRO2/
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
API běží na http://localhost:8000, Swagger UI na http://localhost:8000/docs.

### Frontend (SPA)
```bash
cd TNPW2/src/
python -m http.server 8001
```
Aplikace běží na http://localhost:8001.

### Docker image – export a import
```bash
# Export (uložení image do souboru)
docker save postgres:16 -o postgres16.tar
docker save adminer -o adminer.tar

# Import (načtení image ze souboru na jiném stroji)
docker load -i postgres16.tar
docker load -i adminer.tar
```
Po importu spusť databázi standardně přes `docker compose up -d` v adresáři `DBS2/`.

### JavaScript testy (IR01 – TNPW2)
```bash
cd TNPW2/
node tests/runAllTests.mjs
```

---

## Co projekt neobsahuje
Je nutné zmínit, že se v tomto akademickém projektu soustředíme primárně na databázovou/webovou část a správu logiky. Neřešíme a na implementaci zde nebudeme zařazovat věci jako vyčítání lokálního hardwaru - aplikace sloužící recepcím (lokální .exe či desktopový program komunikující se čtečkami NFC a turnikety pro odpípávání vstupu). Tato klientská odbavovací aplikace bude realizovaná v rámci jiného, odděleného projektu. V návrhu DB s těmito událostmi již ale budeme samozřejmě počítat.
