// Polyfilly pro prohlížečová API (alert, localStorage, history…) – musí být první import.
import './support/browserMock.mjs';

import { testInitialState } from './test/stateTests.mjs';
import { testCreateStore } from './test/storeTests.mjs';
import { testRouter } from './test/routerTests.mjs';
import { testIR02Actions, testDispatcher } from './test/dispatchTests.mjs';
import { testIR03 } from './test/apiTests.mjs';
import { testSelectorIR05 } from './test/selectorTests.mjs';
import { testIR06 as testIR06ViewComposition } from './test/viewTests.mjs';
import { testIR06 as testIR06Handlers } from './test/renderTests.mjs';
import { testIR07 } from './test/handlerTests.mjs';
import { testIR08 } from './test/authTests.mjs';

console.log('==============================');
console.log('  Spouštím testy TNPW2');
console.log('==============================');

testInitialState();
testCreateStore();
testRouter();

await testIR02Actions();
await testDispatcher();
await testIR03();
testSelectorIR05();
testIR06ViewComposition();
testIR06Handlers();
testIR07();
await testIR08();

console.log('\n==============================');
console.log('  Testy dokončeny');
console.log('==============================');
