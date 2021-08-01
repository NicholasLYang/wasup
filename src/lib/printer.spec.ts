import test from 'ava';

import { printInstruction } from './printer';
import { InstrType } from './wasm';

test('printInstruction', (t) => {
  t.is(printInstruction([InstrType.Unreachable]), 'unreachable');
  t.is(printInstruction([InstrType.Nop]), 'nop');
  t.is(printInstruction([InstrType.Return]), 'return');
});
