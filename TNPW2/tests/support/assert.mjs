// Pomocná assert funkce pro unit testy (bez externího frameworku).
// Vzor přebírá z prepare/tests/support/assert.js (referenční projekt učitele).
//
// Použití:
//   assert(2 + 2 === 4, 'Matematika funguje');  // → ✅ OK
//   assert(false, 'Tohle selže');                // → ❌ FAILED – Tohle selže

/**
 * Zkontroluje podmínku a vypíše výsledek do konzole.
 *
 * @param {boolean} condition - Výsledek testované podmínky.
 * @param {string}  message   - Popis co se testuje (zobrazí se ve výstupu).
 */
export function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ OK – ${message}`);
  } else {
    console.error(`  ❌ FAILED – ${message}`);
  }
}
