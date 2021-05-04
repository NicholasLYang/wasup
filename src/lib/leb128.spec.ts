import test from 'ava';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import leb from 'leb128';

import { fromUnsignedLEB128, toUnsignedLEB128 } from './leb128';

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

test('toUnsignedLEB128', (t) => {
  t.deepEqual(toUnsignedLEB128(255), [0xff, 0x01]);
  t.deepEqual(toUnsignedLEB128(127), [parseInt('01111111', 2)]);
});

test('toUnsignedLEB128 vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.unsigned.encode(n.toString());
    const myBuffer = toUnsignedLEB128(n);
    t.is(libBuffer.length, myBuffer.length);

    for (let i = 0; i < libBuffer.length; i++) {
      t.is(libBuffer[i], myBuffer[i]);
    }

    randomInts.add(n);
  }
});

test('fromUnsignedLEB128 vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.unsigned.encode(n.toString());
    const { index: _, value } = fromUnsignedLEB128(libBuffer, 0);
    t.is(value, n);

    randomInts.add(n);
  }
});
