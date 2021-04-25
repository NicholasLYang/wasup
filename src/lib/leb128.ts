function getHighestBit(n: number): number {
  let r = 0; // r will be lg(v)

  while ((n >>= 1) != 0) {
    r++;
  }

  return r + 1
}


/**
 * Converts a number n to unsigned LEB128
 *
 * @param n - Must be an integer.
 * @returns LEB128 encoded integer as a BigInt.
  */
export function toUnsignedLEB128(n: number): Uint8Array {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, instead is ${n}`);
  }

  const inputBitLen = getHighestBit(n);
  const outputBitLen = inputBitLen + Math.ceil(inputBitLen / 7);
  const outputByteLen = Math.ceil(outputBitLen / 8);
  const output = new Uint8Array(outputByteLen);

  let i = 0;
  // Loop until the next to last 7 bytes
  while (n > 0x7f) {
    output[i] = (n & 0x7f) | 0x80;
    i += 1;
    n = n >> 7;
  }
  output[i] = n;
  return output;
}

