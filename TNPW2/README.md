# Architektura SPA - Semestrální projekt (TNPW2)
## Gym Management System (Pretorian)

Tento repozitář obsahuje frontendovou část semestrálního projektu pro předmět TNPW2. Jedná se o webovou Single-Page aplikaci (SPA) vytvořenou v čistém JavaScriptu bez použití frameworků (React, Vue atd.), zaměřenou na propracovanou architekturu, explicitní práci se stavem a oddělení zodpovědností.

Aplikace slouží jako systém pro sportovní klub (Pretorian) zaměřený na správu uživatelů, kreditů, tarifů a rezervací tréninků.

### Hlavní funkce aplikace
- **Registrace a profil uživatele:** Možnost registrace (včetně potvrzení e-mailu), zobrazení zůstatku kreditů, historie vstupů a proběhlých plateb.
- **Kredity a tarify:** Dobíjení kreditů a nákup měsíčních tarifů/permanentek s integrovanou funkcí automatického obnovování.
- **Rezervace:** Přihlašování na tréninky, a správa historie rezervací.
- **Systém pro trenéry:** Vytváření tréninků s využitím šablon, nastavení limitu účastníků, času začátku a konce, jakož i rušení tréninků a rezervací u konkrétních členů.

---

## 1. Architektura aplikace
Aplikace striktně dodržuje vrstvenou SPA architekturu podle zadání předmětu, za využití ES6+ funkcionalit:
- **Stav (State):** Centrální datový model (single source of truth).
- **Akce (Actions):** Explicitně pojmenované záměry systému nebo uživatele.
- **Dispatcher:** Centrální vrstva zpracování (interpretace kontextu akce) a mutování stavu v rámci stanovených pravidel.
- **Selektory (Selectors):** Čisté funkce pro extrakci, filtrování a transformaci dat ze stavu do formátu vhodného pro vykreslení.
- **Pohledy (Views):** Komponenty vytvářené dynamicky a bezpečně explicitním skládáním DOM prvků (`document.createElement`).
- **Infrastruktura:** Různé specifické vrstvy (IR01-IR08) pro API volání, manipulaci s historií (Router), selektory, aj.

## 2. Business Entity a Stavové automaty

### Uživatel (User)
*Entita reprezentující registrovanou osobu v systému a její interakci s profilem, kredity a tarify.*
- **Stavy:** 
  - `GUEST` (nepřihlášený uživatel)
  - `REGISTERED` (přihlášen, ověřen e-mail, dosud bez aktivního tarifu)
  - `ACTIVE_MEMBER` (přihlášen, s aktivním zakoupeným tarifem)
- **Přechody:** 
  - `GUEST` -> `REGISTERED` (po akci `LOGIN` nebo `REGISTER_SUCCESS`)
  - `REGISTERED` -> `ACTIVE_MEMBER` (po akci `BUY_TARIFF`)

### Trénink (Training)
*Entita specifikovaná časem, délkou, limitem hráčů a šablonou.*
- **Stavy:** 
  - `SCHEDULED` (naplánovaný, volná kapacita, přijímá členy)
  - `FULL` (kapacita zcela naplněna)
  - `IN_PROGRESS` (právě probíhá)
  - `COMPLETED` (úspěšně ukončený)
  - `CANCELLED` (zrušený trenérem)
- **Přechody:** 
  - `SCHEDULED` <-> `FULL` (jakmile počet rezervací dosáhne / klesne pod limit vlivem akcí `SIGN_IN` a `SIGN_OUT`)
  - `SCHEDULED` -> `CANCELLED` (po akci `CANCEL_TRAINING_INSTANCE`)

### Rezervace (Reservation)
*Samostatný vztah / session mezi uživatelem a tréninkem.*
- **Stavy:**
  - `PENDING` (žadatel čeká – asynchronní propis / checking)
  - `CONFIRMED` (potvrzená, kredit uplatněn/snížen)
  - `CANCELLED` (zrušená uživatelem nebo trenérem, kredit ev. vracen)

## 3. Popis rolí a povolených akcí
*(Autorizace a ověřování práv je součástí business logiky backendu a redukce dispečeru, nikoliv pouhá vlastnost UI).*

- **ČLEN (Member):**
  - Profil/Platby: `BUY_TARIFF`, `TOGGLE_AUTO_RENEWAL`, `TOP_UP_CREDIT`, `VIEW_OWN_HISTORY`
  - Vstupy: `MAKE_RESERVATION`, `CANCEL_RESERVATION`
- **TRENÉR (Trainer):**
  - Zahrnuje veškeré akce `MEMBER`
  - Správa tréninků: `CREATE_TRAINING`, `CANCEL_TRAINING`, `CANCEL_USER_RESERVATION`
- **GUEST:**
  - `REGISTER`, `LOGIN`, `CONFIRM_EMAIL`


## 4. Infrastruktura

Logika aplikace je rozdělena na 8 klíčových infrastrukturních rolí v souladu s požadavky semestrálního projektu:
- **IR01 (State Management):** Návrh a udržování datového stromu o relacích (kredity, aktivní tréninky, seznam rezervací). Zajišťuje immutable přístupy a prevenci rozporů.
- **IR02 (Dispatcher):** Hlavní interpretace akcí, volání business logiky a iniciace reaktivních změn dat.
- **IR03 (Asynchronní operace a side-effects):** Čistá oddělená vrstva zajišťující HTTP volání, dotazování bankovních logů / zpracování plateb s možnými přesuny do stavů _loading/error_.
- **IR04 (Router):** Mapování a parsování url navigace (history changes) a synchronizace příslušného state (routing `/profile`, `/reservations` atd.).
- **IR05 (Selektory):** Generování odvozené logiky ze stavového automatu, např. filtrování nadcházejících kolekcí tréninků a mapování do zobrazení `canRegister`.
- **IR06 (View Composition):** Abstrakce domového vykreslování izolující rozhodování, _co zobrazit_ a _jak to sestavit_.
- **IR07 (Handlery):** Generických převod User-Inputs (např. kliknutí na potvrzovací tlačítko dobíječe) formou event bindů plně v režimu převodu UI -> dispatch action.
- **IR08 (Autentizace):** Práce s JWT tokeny nebo ukládání state klíčů o identitě klienta z technického hlediska (login retention).

## 5. Mapování odpovědností na členy týmu (Rozdělení - Výstup 1)
> *Rozdělení doplňte vlastními jmény. Dokument Výstup 1 je oddělenou smluvní poviností, tato tabulka slouží jako stručná demonstrace odpovědností.*

### Člen týmu 1: Jan Pospíšil
- **Business odpovědnost:** 
  - Správa profilů (Entity Uživatel / GUEST / Člen), systém plateb, správa kreditu a automatický nákup/obnovování tarifů. (Entita: **Uživatel**)
- **Infrastrukturní role:** 
  - **IR01 (State Management):** Návrh globální struktury stavu, incializace a prevence nekonzistencí datového stromu.
  - **IR03 (Asynchronní operace a side-effects):** Řešení komunikace se serverem, integrace platebních metod a dotazů do bankovních logů (přechod do stavů loading/error).
  - **IR04 (Router):** Mapování a parsování url navigace, synchronizace stavu SPA v závislosti na změnách v historii prohlížeče.
  - **IR08 (Autentizace a technická autorizace):** Práce s přihlašováním, ukládání tokenů/session dat a počáteční zhodnocení přístupnosti z technického hlediska.

### Člen týmu 2: Jiří Černák
- **Business odpovědnost:** 
  - Životní cyklus tréninků (tvorba, rušení, limitace pro účastníky) a rezervační systém (validace nákupů a rezervací přes kredity/tarify). (Entity: **Trénink** a **Rezervace**)
- **Infrastrukturní role:**
  - **IR02 (Dispatcher):** Interpretace systémových a uživatelských akcí, volání business logiky (reducer) a centrální zápis do state managementu.
  - **IR05 (Selektory):** Vystavení odvozených a složitých stavových dat (např. "které tréninky je povoleno registrovat" s ohledem na entitu probíhajících rezervací).
  - **IR06 (View Composition):** Centrální renderovací systémy (komponenty), striktní rozdělení view vrstev skrz nativní `createElement` bez použití `innerHTML`.
  - **IR07 (Handlery a vazba UI na akce):** Komplexní bindování událostí odesílajících záměry uživatelů (např. stisknutí tlačítka pro rezervaci -> dispatcher).
