import { testInitialState } from './test/stateTests.mjs';
import { testCreateStore } from './test/storeTests.mjs';
import { testRouter } from './test/routerTests.mjs';
import { testIR02Actions, testDispatcher } from './test/dispatchTests.mjs';
import { testSelectorIR05 } from './test/selectorTests.mjs';
import { testIR06 } from './test/renderTests.mjs'; // Část IR07 logic (createHandlers)
import { testIR07 } from './test/handlerTests.mjs';

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
testIR07();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
