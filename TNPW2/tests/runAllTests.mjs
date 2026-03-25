// Vstupní bod pro spuštění všech testů IR01.
// Spustit příkazem:  node tests/runAllTests.mjs
// (z adresáře TNPW2/)

import { testInitialState } from './test/stateTests.mjs';

console.log('==============================');
console.log('  Spouštím testy IR01 (TNPW2)');
console.log('==============================');

testInitialState();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
