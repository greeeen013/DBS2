// Vstupní bod pro spuštění všech testů IR01 + IR02 + Router + IR05 + IR06.
// Spustit příkazem:  node tests/runAllTests.mjs
// (z adresáře TNPW2/)

import { testInitialState } from './test/stateTests.mjs';
import { testCreateStore } from './test/storeTests.mjs';
import { testRouter } from './test/routerTests.mjs';
import { testIR02Actions, testDispatcher } from './test/dispatchTests.mjs';
import { testSelectorIR05 } from './test/selectorTests.mjs';
import { testIR06 } from './test/renderTests.mjs';

console.log('==============================');
console.log('  Spouštím testy TNPW2');
console.log('==============================');

testInitialState();
testCreateStore();
testRouter();

await testIR02Actions();
await testDispatcher();
testSelectorIR05();
testIR06();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
