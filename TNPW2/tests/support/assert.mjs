// Pomocná assert funkce pro unit testy (bez externího frameworku).
// Vzor přebírá z prepare/tests/support/assert.js (referenční projekt učitele).
//
// Použití:
//   assert(2 + 2 === 4, 'Matematika funguje');  // → ✅ OK
//   assert(false, 'Tohle selže');                // → ❌ FAILED – Tohle selže
//
// Při selhání nastavíme process.exitCode = 1, aby CI (GitHub Actions apod.)
// poznalo, že testy neprošly – pouhý console.error by exit code neovlivnil.

/**
 * Zkontroluje podmínku a vypíše výsledek do konzole.
 * Při selhání nastaví process.exitCode = 1 (non-zero = chyba v CI).
 *
 * @param {boolean} condition - Výsledek testované podmínky.
 * @param {string}  message   - Popis co se testuje (zobrazí se ve výstupu).
 */
export function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ OK – ${message}`);
  } else {
    console.error(`  ❌ FAILED – ${message}`);
    // Nastavíme chybový exit code – proces doběhne do konce (uvidíme všechna selhání),
    // ale skončí s kódem 1, který CI vyhodnotí jako neúspěšný běh testů.
    process.exitCode = 1;
  }
}
