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

## 5. Rozdělení business odpovědností
*Každý student odpovídá za definovanou část doménového modelu a její chování v čase (stavový automat), a to včetně implementace backendové aplikační logiky (API) a příslušného uživatelského rozhraní (UI) pro jemu svěřenou entitu.*

### Student A: [Jan Pospíšil](https://github.com/greeeen013)
- **Business entita:** `Reservation` (Rezervace) a `Payment` (Platba)
- **Odpovědnost:** Správa procesu přihlášení uživatele na vypsanou lekci, validace volných míst při vytváření rezervace, propojování rezervace s platbami (`ReservationPayment`), odepisování kreditů či zpracování JSON platebních detailů. Naprogramování API pro tyto procesy a tvorba UI formulářů pro platbu a detail rezervace.

#### Stavový automat: `ReservationStatus`
- **Stavy:**
  - `CREATED` (Vytvořena): Počáteční stav, uživatel zvolil termín a místo je dočasně blokováno.
  - `CONFIRMED` / `PAID` (Potvrzena): Systém ověřil úspěšnou platbu a rezervaci závazně uložil.
  - `CANCELLED` (Zrušena): Uživatel zrušil rezervaci před uplynutím storno limitu, nebo vypršel čas na zaplacení.
  - `ATTENDED` / `COMPLETED` (Odbavená): Čas lekce uplynul a uživatel se jí zúčastnil (koncový stav).
- **Pravidla přechodů:**
  - Přechod do `PAID` striktně vyžaduje vytvoření validního záznamu v tabulce `Payment`.
  - Při přechodu do `CANCELLED` se uvolňuje místo pro další členy (vysílá se akce pro úpravu kapacity).
- **Invarianty (Pravidla, která nesmí být nikdy porušena):**
  - Pokud je status rezervace `PAID`, musí k ní existovat navázaný platný záznam v tabulce `Payment`.
  - Celková částka (nebo stržený kredit) v entitě `Payment` musí plně pokrývat cenu lekce (po případném odečtení `DiscountCode`).

### Student B: [Jiří Černák](https://github.com/SlightlySaltedTeriyaki)
- **Business entita:** `Scheduled_Lesson` (Rozvrhovaná lekce) a `Attendance` (Docházka)
- **Odpovědnost:** Správa životního cyklu konkrétní lekce v rozvrhu (tvořené z `Lesson_Template`), hlídání naplněnosti kapacity (atribut `Registered_members`), přiřazování trenérů (`Employee`) a zápis poznámek k lekci. Naprogramování API pro tyto procesy a tvorba UI pro kalendář/rozvrh lekcí a formulář pro vytvoření/úpravu lekce.

#### Stavový automat: `LessonStatus`
- **Stavy:**
  - `OPEN` (Otevřena): Lekce je zveřejněna v rozvrhu, lze na ni vytvářet rezervace.
  - `FULL` (Plná kapacita): Počet rezervací dosáhl maxima, další rezervace nejsou možné.
  - `IN_PROGRESS` (Probíhá): Čas lekce právě nastal, nelze již rušit rezervace.
  - `COMPLETED` (Ukončena): Lekce skončila, otevírá se možnost zápisu docházky (`Attendance`).
  - `CANCELLED` (Zrušena): Lekce byla trvale zrušena trenérem.
- **Pravidla přechodů:**
  - Přechod z `OPEN` do `FULL` se spouští na základě nárůstu počtu potvrzených rezervací.
  - Pokud lekce přejde do `CANCELLED`, systém musí zneplatnit existující rezervace (akce pro Studenta A).
- **Invarianty (Pravidla, která nesmí být nikdy porušena):**
  - Hodnota `Registered_members` nesmí nikdy překročit definovanou maximální kapacitu lekce (`registered_members <= maximal_capacity`).
  - Pokud je lekce ve stavu `CANCELLED`, žádná na ni navázaná rezervace nesmí zůstat ve stavu `CONFIRMED`.

---

## 6. Rozdělení infrastrukturních rolí

### Student A: [Jan Pospíšil](https://github.com/greeeen013)
- **IR01 – Správa stavu aplikace (State Management)**
  - **Zajišťuje:** Návrh a implementaci centrálního datového úložiště (Store) pro celou aplikaci, zajištění immutability dat při úpravách rezervací nebo rozvrhu v paměti a oddělení doménových dat (z API) od těch technických (stav UI).
  - **Nezahrnuje:** Přímé mutace stavu komponentami (UI), vykreslování obrazovky.
- **IR03 – Asynchronní operace a side-effects**
  - **Zajišťuje:** Komunikaci s backendem a společnou databází (REST API), řízení asynchronních procesů (čekání na potvrzení platby), centrální řízení loading stavů a zpracování chyb.
  - **Nezahrnuje:** Rozhodování o validitě obchodních pravidel (řeší API).
- **IR04 – Router / Navigační logika**
  - **Zajišťuje:** Klientské routování pomocí History API, mapování URL (např. `/lesson/123`) na pohledy, synchronizaci adresy prohlížeče se stavem.
  - **Nezahrnuje:** Sestavování DOM stromu daného pohledu (řeší IR06).
- **IR08 – Autentizace a technická autorizace**
  - **Zajišťuje:** Správu identity a rolí (`Account_Role`, `Employee_Role`), ukládání session tokenu a inicializaci autentizačního stavu aplikace, technickou kontrolu oprávnění v UI.
  - **Nezahrnuje:** Skutečné bezpečnostní zamítnutí operace (to musí dělat API vrstva).

### Student B: [Jiří Černák](https://github.com/SlightlySaltedTeriyaki)
- **IR02 – Dispatcher / Interpretace akcí**
  - **Zajišťuje:** Přijímání a zpracování akcí z UI, jejich rozdělování pro příslušné reducery (např. `ADD_RESERVATION`, `CANCEL_LESSON`) a vyvolání signálu ke změně centrálního stavu.
  - **Nezahrnuje:** Přímou manipulaci s DOM stromem, definici business pravidel.
- **IR05 – Selektory (Výběr dat ze stavu)**
  - **Zajišťuje:** Tvorbu funkcí transformujících globální stav pro potřeby UI, filtraci dat (např. dostupné lekce pro aktuální týden), výpočet odvozených hodnot (zbývající volná kapacita).
  - **Nezahrnuje:** Úpravy dat ve Store (read-only přístup).
- **IR06 – Renderovací logika (View Composition)**
  - **Zajišťuje:** Sestavování komponent a pohledů výhradně pomocí čistého DOM API, převod view-state na UI strukturu, podmíněné zobrazení částí UI (např. tlačítko "Zapsat docházku" jen u lekce `COMPLETED`).
  - **Nezahrnuje:** Rozhodování o tom, co se má stát po interakci (to je delegováno na Handlery).
- **IR07 – Handlery a vazba UI → akce**
  - **Zajišťuje:** Připojování Event Listenerů na prvky v UI, převod uživatelských interakcí na volání akcí, odesílání sestavených objektů do Dispatcheru (IR02).
  - **Nezahrnuje:** Přímé změny stavu z UI (aplikace striktně dodržuje Unidirectional Data Flow).

---

## 7. Rozhraní mezi částmi systému

### Business rozhraní
- **`Scheduled_Lesson` poskytuje operace:** `openLesson`, `cancelLesson`, `updateCapacity` (dle počtu rezervací), `closeLesson` / `markInProgress`.
- **`Reservation` poskytuje operace:** `createReservation` (včetně iniciace platby), `cancelReservation`, `markAttended` (provázáno se zápisem docházky).
- **`Reservation` reaguje na změny `Scheduled_Lesson`:**
  - Pokud `lesson.status ≠ OPEN` → blokuje vytváření nových rezervací.
  - Pokud `lesson.status = CANCELLED` → automaticky stornuje navázané `CONFIRMED` rezervace (a iniciuje proces vrácení kreditů).

### Datové kontrakty
- **Sdílené objekty:** `Scheduled_Lesson`, `Reservation`, `Payment`, `Attendance`.
- **Vlastník dat:**
  - `Reservation` a `Payment` – Student A
  - `Scheduled_Lesson` a `Attendance` – Student B
- **Kdo smí měnit stav:**
  - Status `Reservation` a `Scheduled_Lesson` mění pouze jejich přechodové funkce.
  - Centrální state mění výhradně dispatcher přes definované mutace.

### Technická hranice (Tok dat)
1. **UI** → Handlery (IR07) → Dispatcher (IR02)
2. **Dispatcher** → Asynchronní vrstva (IR03)
3. **Asynchronní vrstva** → API
4. **API** vrací změněné entity (např. potvrzenou rezervaci)
5. **Dispatcher** aktualizuje state (IR01)
6. **Selektory** (IR05) připravují data pro UI
7. **Render** (IR06) vykresluje aktuální view-state

*Každá vrstva má jasného vlastníka a nesmí zasahovat do odpovědnosti jiné vrstvy.*

---

## 8. Způsob spolupráce a kontroly práce

- **Sledování práce:**
  - Každá infrastruktura i business část má vlastní issue na GitHubu.
  - Každá business operace má vlastní test.
- **Kontrola kvality:**
  - Žádná business logika ve View.
  - Žádná přímá mutace stavu mimo dispatcher.
  - Žádná autorizace v UI (pouze na úrovni skrytí prvků, kontrola je na API).
- **Řešení nesplnění odpovědnosti:**
  - Eskalace na společné schůzce.
  - Simulace chybějící části pomocí Mock dat (aby nedošlo k blokování vývoje).
  - Přerozdělení práce po dohodě (v krajním případě informování vyučujícího).
