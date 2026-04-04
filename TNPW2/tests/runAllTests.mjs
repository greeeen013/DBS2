// Vstupní bod pro spuštění všech testů IR01.
// Spustit příkazem:  node tests/runAllTests.mjs
// (z adresáře TNPW2/)

import { testInitialState } from './test/stateTests.mjs';
import { testCreateStore } from './test/storeTests.mjs';
import { testRouter } from './test/routerTests.mjs';

console.log('==============================');
console.log('  Spouštím testy TNPW2');
console.log('==============================');

testInitialState();
testCreateStore();
testRouter();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
