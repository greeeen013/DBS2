// Vstupní bod pro spuštění všech testů IR01 + IR02 + Router.
// Spustit příkazem:  node tests/runAllTests.mjs
// (z adresáře TNPW2/)

import { testInitialState } from './test/stateTests.mjs';
import { testCreateStore } from './test/storeTests.mjs';
import { testRouter } from './test/routerTests.mjs';
import { testIR02Actions, testDispatcher } from './test/dispatchTests.mjs';

console.log('==============================');
console.log('  Spouštím testy TNPW2');
console.log('==============================');

testInitialState();
testCreateStore();
testRouter();

// IR02 testy jsou async – čekáme na dokončení
await testIR02Actions();
await testDispatcher();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
