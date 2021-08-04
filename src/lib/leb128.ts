export function getHighestBit(n: number): number {
  let r = 0; // r will be lg(v)

  while ((n >>= 1) != 0) {
    r++;
  }

  return r + 1;
}

/**
 * Gets the size of a number if it were to be encoded in unsigned LEB128
 *
 * @param n - Number not encoded.
 * @returns Width of the encoded number in bytes.
 */
export function getLEB128USize(n: number): number {
  if (n === undefined) {
    throw new Error(`n shouldn't be undefined`);
  }
  if (n <= 2 ** 7 - 1) {
    return 1;
  }
  if (n <= 2 ** 14 - 1) {
    return 2;
  }
  if (n <= 2 ** 21 - 1) {
    return 3;
  }
  if (n <= 2 ** 28 - 1) {
    return 4;
  }
  if (n <= 2 ** 35 - 1) {
    return 5;
  }
  if (n <= 2 ** 42 - 1) {
    return 6;
  }
  throw new RangeError(`n is too large for varuint32: ${n}`);
}

/**
 * Gets the size of a number if it were to be encoded in signed LEB128
 *
 * @param n - Number not encoded.
 * @returns Width of the encoded number in bytes.
 */
export function getLEB128SSize(n: number): number {
  if (n <= 2 ** 6 - 1 && n >= -(2 ** 6)) {
    return 1;
  }

  if (n <= 2 ** 13 - 1 && n >= -(2 ** 13)) {
    return 2;
  }
  if (n <= 2 ** 20 - 1 && n >= -(2 ** 20)) {
    return 3;
  }
  if (n <= 2 ** 27 - 1 && n >= -(2 ** 27)) {
    return 4;
  }
  if (n <= 2 ** 34 - 1 && n >= -(2 ** 34)) {
    return 5;
  }
  if (n <= 2 ** 41 - 1 && n >= -(2 ** 41)) {
    return 6;
  }
  throw new RangeError(`n is too large for varuint32: ${n}`);
}

/**
 * Converts a number n to unsigned LEB128
 *
 * @param n - Must be an integer.
 * @param buffer - Buffer to write into
 * @param startIndex - Start index for writing
 * @returns End index for encoder.
 */
export function toLEB128U(
  n: number,
  buffer: Uint8Array,
  startIndex: number
): number {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, instead is ${n}`);
  }

  let i = startIndex;
  // Loop until the next to last 7 bytes
  while (n > 0x7f) {
    buffer[i] = (n & 0x7f) | 0x80;
    i += 1;
    n = n >> 7;
  }

  buffer[i] = n;
  return i + 1;
}

/**
 * Converts a number n to signed LEB128
 *
 * @param n - Must be an integer.
 * @param buffer - Buffer to write into
 * @param startIndex - Start index for writing
 * @returns End index for encoder.
 */
export function toLEB128S(
  n: number,
  buffer: Uint8Array,
  startIndex: number
): number {
  if (!Number.isInteger(n)) {
    throw new RangeError(`n must be an integer, instead is ${n}`);
  }

  let i = startIndex;
  n |= 0;
  while (true) {
    const byte = n & 0x7f;
    n >>= 7;
    if ((n === 0 && (byte & 0x40) === 0) || (n === -1 && (byte & 0x40) !== 0)) {
      buffer[i] = byte;
      return i + 1;
    }
    buffer[i] = byte | 0x80;
    i += 1;
  }
}

/**
 * Converts an unsigned LEB128 number to a JavaScript number, along with the
 * new end index
 *
 * @param buffer - Byte array for encoded values.
 * @param index - Where we read the value
 * @returns The integer value at buffer[index] along with the end index + 1.
 */
export function fromLEB128U(
  buffer: Uint8Array,
  index: number
): { index: number; value: number } {
  if (index >= buffer.length || index < 0 || !Number.isInteger(index)) {
    throw new RangeError(`Invalid index: ${index}`);
  }

  let value = 0;
  let shiftOffset = 0;
  // Loop until the next to last 7 bytes
  while (true) {
    value = value | ((buffer[index] & 0x7f) << shiftOffset);
    shiftOffset += 7;
    if ((buffer[index] & 0x80) === 0) {
      break;
    }
    index += 1;
  }

  if (buffer[index] === undefined) {
    throw new RangeError(`Reached end of buffer while decoding LEB128 value`);
  }

  return { value, index: index + 1 };
}

/**
 * Converts a signed LEB128 number to a JavaScript number, returns the
 * number and the updated buffer index
 *
 * @param buffer - Byte array for encoded values.
 * @param index - Where we read the value
 * @returns The integer value at buffer[index] along with the end index + 1.
 */
export function fromLEB128S(
  buffer: Uint8Array,
  index: number
): { index: number; value: number } {
  if (index >= buffer.length || index < 0 || !Number.isInteger(index)) {
    throw new RangeError(`Invalid index: ${index}`);
  }

  let value = 0;
  let shiftOffset = 0;
  // Loop until the next to last 7 bytes
  while (true) {
    value = value | ((buffer[index] & 0x7f) << shiftOffset);
    shiftOffset += 7;
    if ((buffer[index] & 0x80) === 0) {
      if (shiftOffset < 32 && (buffer[index] & 0x40) !== 0) {
        value = value | (~0 << shiftOffset);
      }
      break;
    }
    index += 1;
  }

  if (buffer[index] === undefined) {
    throw new RangeError(`Reached end of buffer while decoding LEB128 value`);
  }

  return { value, index: index + 1 };
}
