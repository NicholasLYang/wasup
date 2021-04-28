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
 * @returns LEB128 encoded integer as a BigInt.
 */
export function toUnsignedLEB128(n: number): number[] {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, instead is ${n}`);
  }

  const output = [];

  // Loop until the next to last 7 bytes
  while (n > 0x7f) {
    output.push((n & 0x7f) | 0x80);
    n = n >> 7;
  }

  output.push(n);
  return output;
}
