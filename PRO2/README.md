# Semestrální projekt - PRO2

Tento repozitář obsahuje backendovou část semestrálního projektu, který je tvořen společně pro předměty **PRO2**, **TNPW2** a **DBS2**.

## 🛠️ Technologie a Architektura
Ačkoliv je výchozím jazykem pro PRO2 Java, projekt využívá **Python** jako plně objektový jazyk. Ten splňuje požadavky na principy Inversion of Control (IoC) a Dependency Injection (DI) a podporuje ORM frameworky.

Při výběru knihoven pro projekt na straně backendu striktně dodržujeme zásadní pravidlo vyplývající z předmětu TNPW2: 
> *"Použití knihoven je povoleno pouze tehdy, pokud nenahrazují architekturu, ale řeší dílčí technický problém."*

**Hlavní knihovny pro backend:**
- **[Zvolený Web Framework – např. FastAPI nebo Flask]**: Nejedná se o "hotovou architekturu", ale o nástroj pro vyřešení dílčího technického problému (infrastruktura pro routování HTTP rozhraní a tvorba API pro frontend).
- **SQLAlchemy (nebo PeeWee)**: Knihovna sloužící jako ORM (Object-Relational Mapping). Řeší výhradně komunikaci s relační databází, čímž splňujeme zásadní požadavek pro PRO2 a integraci pro DBS2.
- **Dependency Injector / kontejner pro DI**: Slouží k vynucení a ulehčení principů IoC a DI, které jsou pro PRO2 povinné.
- **Pytest**: Využívá se čistě pro potřeby jednotkových textů (unit testování).

## ✅ Plnění požadavků PRO2
Kód aplikačního serveru je navržen tak, aby společně se SPA frontendem z TNPW2 pokrýval minimální požadavky na složitost:
- **Minimálně 10 modelových tříd**: Odpovídající business entitám mapovaným prostřednictvím ORM do databáze.
- **Jednoduchý frontend**: Obstarán a rozpracován primárně dle architektury a požadavků TNPW2.
- **Připojení na relační databázi**: Data persistence využívající definovaný ORM framework.
- **Jednotkové testy**: Každý člen vývojové dvojice dokládá testovací scénáře (nebo testy) prokazující funkčnost vlastních backendových a business vrstev a modelů.
- **Přihlašování uživatelů**: Správa uživatelské identity, kde autentizace slouží jako infrastrukturní role a autorizace je pevnou součástí business logiky.
- **Originální téma**: [Zde doplňte samotné téma a zaměření vaší webové aplikace]

## 🤝 Týmová práce a Organizace
Projekt tvoří a odevzdává tým ve složení 2 lidí. Organizace vývoje:
- Každý člen týmu odpovídá za konkrétní sadu business entit, infrastrukturu a vybrané API/backend cesty.
- Na obhajobě každý prezentuje pouze ty části backendu a architektury, za které zodpovídal.
- Aplikace je evidována ve verzovacím systému (GitHub/GitLab) a dělba práce je striktně dohledatelná pomocí commitů prováděných ze separátních účtů obou vývojářů.

---
*Pro technické detaily distribuce stavu, specifikace dispatcheru nebo detailní mapování frontendových zodpovědností nahlédněte do přiložené architektonické dokumentace specifikované pro předmět TNPW2.*
