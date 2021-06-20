export function buf2hex(buffer: Uint8Array): string {
  // buffer is an ArrayBuffer
  return [...buffer].map((x) => x.toString(16).padStart(2, '0')).join(', ');
}
