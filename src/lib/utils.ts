export function buf2hex(buffer: Uint8Array): string {
  // buffer is an ArrayBuffer
  return [...buffer].map((x) => x.toString(16).padStart(2, '0')).join(', ');
}

export function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}

// Get random integer in varuint32 range
export function getRandomLEB128U() {
  return getRandomInt(2_147_483_647);
}

export function getRandomIntArray(len: number) {
  const arr = [];
  for (let i = 0; i < len; i++) {
    arr.push(getRandomLEB128U());
  }

  return arr;
}
