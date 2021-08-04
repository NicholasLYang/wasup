import test from 'ava';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import leb from 'leb128';

import {
  getLEB128USize,
  getLEB128SSize,
  fromLEB128U,
  fromLEB128S,
  toLEB128S,
  toLEB128U,
} from './leb128';
import { getRandomInt } from './utils';

test('toLEB128U vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.unsigned.encode(n.toString());
    const myBuffer = new Uint8Array(getLEB128USize(n));
    toLEB128U(n, myBuffer, 0);
    t.is(libBuffer.length, myBuffer.length);

    for (let i = 0; i < libBuffer.length; i++) {
      t.is(libBuffer[i], myBuffer[i]);
    }

    randomInts.add(n);
  }
});

test('toLEB128S vs leb128 package', (t) => {
  const randomInts = new Set();
  for (let i = 0; i < 1000; i++) {
    const n = getRandomInt(2_147_483_647);

    if (randomInts.has(n)) {
      continue;
    }

    const libBuffer = leb.signed.encode(n.toString());
    const myBuffer = new Uint8Array(getLEB128SSize(n));
    toLEB128S(n, myBuffer, 0);

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
    const { value } = fromLEB128U(libBuffer, 0);
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
    const { value } = fromLEB128S(libBuffer, 0);
    t.is(value, n);

    randomInts.add(n);
  }
});
