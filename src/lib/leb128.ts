export function getHighestBit(n: number): number {
  let r = 0; // r will be lg(v)

  while ((n >>= 1) != 0) {
    r++;
  }

  return r + 1;
}

/**
 * Gets the size of a number if it were to be encoded in LEB128
 *
 * @param n - Number not encoded.
 * @returns Width of the encoded number in bytes.
 */
export function getEncodedSize(n: number): number {
  if (n < 2 ** 7 - 1) {
    return 1;
  }
  if (n < 2 ** 14 - 1) {
    return 2;
  }
  if (n < 2 ** 21 - 1) {
    return 2;
  }
  if (n < 2 ** 28 - 1) {
    return 3;
  }
  if (n < 2 ** 35 - 1) {
    return 4;
  }
  if (n < 2 ** 42 - 1) {
    return 5;
  }
  throw new RangeError(`n is too large for varuint32: ${n}`);
}

/**
 * Converts a number n to unsigned LEB128
 *
 * @param n - Must be an integer.
 * @param buffer - If included, we write to the buffer
 * @returns LEB128 encoded integer as a BigInt.
 */
export function toUnsignedLEB128(n: number, buffer?: Uint8Array): Uint8Array {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, instead is ${n}`);
  }

  const inputBitLen = getHighestBit(n);
  const outputBitLen = inputBitLen + Math.ceil(inputBitLen / 7);
  const outputByteLen = Math.ceil(outputBitLen / 8);
  const output = buffer ?? new Uint8Array(outputByteLen);

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
