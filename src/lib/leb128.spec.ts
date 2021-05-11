import test from 'ava';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import leb from 'leb128';

import { fromLEB128U, toUnsignedLEB128, fromLEB128S } from './leb128';

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

test('fromLEB128U vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.unsigned.encode(n.toString());
    const { index: _, value } = fromLEB128U(libBuffer, 0);
    t.is(value, n);

    randomInts.add(n);
  }
});

test('fromLEB128S vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.signed.encode(n.toString());
    const { index: _, value } = fromLEB128S(libBuffer, 0);
    t.is(value, n);

    randomInts.add(n);
  }
});
