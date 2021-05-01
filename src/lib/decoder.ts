import { fromUnsignedLEB128 } from './leb128';
import { Section } from './wasm';

export function decodeModule(encodedModule: Uint8Array) {
  if (encodedModule.length < 8) {
    throw new Error(`Module must have at least magic number and version`);
  }

  if (
    encodedModule[0] !== 0x00 ||
    encodedModule[1] !== 0x61 ||
    encodedModule[2] !== 0x73 ||
    encodedModule[3] !== 0x6d
  ) {
    const badMagicNumber =
      encodedModule[0].toString(16) +
      encodedModule[1].toString(16) +
      encodedModule[2].toString(16) +
      encodedModule[3].toString(16);
    throw new Error(`Expected magic number, received ${badMagicNumber}`);
  }

  if (
    encodedModule[4] !== 0x01 ||
    encodedModule[5] !== 0x00 ||
    encodedModule[6] !== 0x00 ||
    encodedModule[7] !== 0x00
  ) {
    const badVersion =
      encodedModule[4].toString(16) +
      encodedModule[5].toString(16) +
      encodedModule[6].toString(16) +
      encodedModule[7].toString(16);

    throw new Error(`Invalid version: ${badVersion}`);
  }

  let index = 0;
  decodeSectionPreamble(encodedModule, 8);
}

interface DecodeResult<T> {
  index: number;
  value: T;
}

export function decodeSection<Id extends number, Item>(
  encodedModule: Uint8Array,
  startIndex: number
): DecodeResult<Section<Id, Item>> {
  const { index: sizeIndex, value: size } = fromUnsignedLEB128(
    encodedModule,
    startIndex + 1
  );

  switch (encodedModule[startIndex]) {
    case 1:

    case 2:
      break;
  }
  return sizeIndex + size;
}

function decodeVector<T>(
  encodedModule: Uint8Array,
  startIndex: number,
  decodeFn: (buffer: Uint8Array, startIndex: number) => T
): T[] {
  let { index, value: length } = fromUnsignedLEB128(encodedModule, startIndex);

  for (let i = 0; i < length; i++) {}
}
