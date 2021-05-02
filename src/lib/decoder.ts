import { createModule } from './builder';
import { fromUnsignedLEB128 } from './leb128';
import {
  AnySection,
  Export,
  ExternalKind,
  FuncType,
  Global,
  GlobalType,
  ImportEntry,
  Module,
  NumType,
  OpCode,
  RefType,
  ResizableLimits,
  Section,
  TableType,
  ValueType,
} from './wasm';

interface Decoder {
  index: number;
  bytes: Uint8Array;
  decodedSections: Set<number>;
}

export function decodeModule(encodedModule: Uint8Array) {
  const decoder = { index: 0, bytes: encodedModule };
  const module = createModule();
  decodeModulePreamble(decoder);
  decodeSection(decoder, module);
}

function decodeModulePreamble(decoder: Decoder) {
  if (decoder.bytes.length < 8) {
    throw new Error(`Module must have at least magic number and version`);
  }

  if (
    decoder.bytes[0] !== 0x00 ||
    decoder.bytes[1] !== 0x61 ||
    decoder.bytes[2] !== 0x73 ||
    decoder.bytes[3] !== 0x6d
  ) {
    const badMagicNumber =
      decoder.bytes[0].toString(16) +
      decoder.bytes[1].toString(16) +
      decoder.bytes[2].toString(16) +
      decoder.bytes[3].toString(16);
    throw new Error(`Expected magic number, received ${badMagicNumber}`);
  }

  if (
    decoder.bytes[4] !== 0x01 ||
    decoder.bytes[5] !== 0x00 ||
    decoder.bytes[6] !== 0x00 ||
    decoder.bytes[7] !== 0x00
  ) {
    const badVersion =
      decoder.bytes[4].toString(16) +
      decoder.bytes[5].toString(16) +
      decoder.bytes[6].toString(16) +
      decoder.bytes[7].toString(16);

    throw new Error(`Invalid version: ${badVersion}`);
  }

  decoder.index = 8;
}

// Small wrapper on fromUnsignedLEB128 to mutate decoder
function decodeLEB128(decoder: Decoder): number {
  const { index, value } = fromUnsignedLEB128(decoder.bytes, decoder.index);
  decoder.index = index;
  return value;
}

function decodeByte(decoder: Decoder): number {
  const byte = decoder.bytes[decoder.index];
  decoder.index += 1;
  return byte;
}

export function decodeSection(decoder: Decoder, module: Module): AnySection {
  const id = decodeByte(decoder);
  const size = decodeLEB128(decoder);
  const startIndex = decoder.index;

  if (id !== 0) {
    if (decoder.decodedSections.has(id)) {
      throw new Error(
        `Encountered second section with id ${id}. Cannot have duplicate sections`
      );
    }
    decoder.decodedSections.add(id);
  }

  switch (id) {
    case 1: {
      module.types.items = decodeVector(decoder, decodeFuncType);
      break;
    }
    case 2: {
      module.imports.items = decodeVector(decoder, decodeImport);
      break;
    }
    case 3: {
      module.functions.items = decodeVector(decoder, decodeLEB128);
      break;
    }
    case 4: {
      module.tables.items = decodeVector(decoder, decodeTableType);
      break;
    }
    case 5: {
      module.memories.items = decodeVector(decoder, decodeResizableLimits);
      break;
    }
    case 6: {
      module.globals.items = decodeVector(decoder, decodeGlobal);
      break;
    }
    case 7: {
      module.exports.items = decodeVector(decoder, decodeExport);
      break;
    }
    case 8: {
      module.start = { id: 8, startFunction: decodeLEB128(decoder) };
      break;
    }
    default: {
      throw new Error(`Unexpected section id: ${id}`);
    }
  }

  if (decoder.index !== startIndex + size) {
    const actualSize = decoder.index - startIndex;
    throw new Error(
      `Section is not ${size} bytes long, instead is ${actualSize} bytes long`
    );
  }
}

function decodeVector<T>(
  decoder: Decoder,
  decodeFn: (decoder: Decoder) => T
): T[] {
  const length = decodeLEB128(decoder);
  const items = [];

  for (let i = 0; i < length; i++) {
    items.push(decodeFn(decoder));
  }

  return items;
}

function decodeExport(decoder: Decoder): Export {
  const name = decodeString(decoder);
  const kind = decodeByte(decoder);
  const index = decodeLEB128(decoder);

  switch (kind) {
    case ExternalKind.Function:
    case ExternalKind.Table:
    case ExternalKind.Memory:
    case ExternalKind.Global:
      return { name, kind, index };
    default:
      throw new Error(
        `Unexpected export description kind: ${kind.toString(16)}`
      );
  }
}

function decodeGlobal(decoder: Decoder): Global {
  const type = decodeGlobalType(decoder);
  const initExpr = decodeExpr(decoder);

  return { type, initExpr };
}

function decodeExpr(decoder: Decoder): OpCode[] {
  let i = decoder.index;
  const opcodes = [];
  while (decoder.bytes[i] !== 0x0b) {
    if (i >= decoder.bytes.length) {
      throw new Error(
        `Reached end of program without finding end of expression (0x0b)`
      );
    }

    opcodes.push(decoder.bytes[i]);
    i += 1;
  }

  return opcodes;
}

function decodeImport(decoder: Decoder): ImportEntry {
  const module = decodeString(decoder);
  const field = decodeString(decoder);
  const kind = decodeByte(decoder);

  switch (kind) {
    case 0x00: {
      const typeIndex = decodeLEB128(decoder);
      return { field, module, description: { kind, typeIndex } };
    }
    case 0x01: {
      const tableType = decodeTableType(decoder);
      return { field, module, description: { kind, tableType } };
    }
    case 0x02: {
      const memoryType = decodeResizableLimits(decoder);
      return { field, module, description: { kind, memoryType } };
    }
    case 0x03: {
      const globalType = decodeGlobalType(decoder);
      return { field, module, description: { kind, globalType } };
    }
    default: {
      throw new Error(
        `Unexpected import description kind. Expected 0x00, 0x01, 0x02 or 0x03, received ${kind.toString(
          16
        )}`
      );
    }
  }
}

function decodeGlobalType(decoder: Decoder): GlobalType {
  const valType = decodeValueType(decoder);
  const mutability = decodeByte(decoder);

  if (mutability !== 0 && mutability !== 1) {
    throw new Error(
      `Expected 0x00 or 0x01 for mutability in global type, received: ${mutability.toString(
        16
      )}`
    );
  }

  return { type: valType, mutability: mutability === 1 };
}

function decodeTableType(decoder: Decoder): TableType {
  const refTypeByte = decodeByte(decoder);
  let refType: RefType;

  switch (refTypeByte) {
    case 0x70:
      refType = RefType.funcRef;
      break;
    case 0x6f:
      refType = RefType.externRef;
      break;
    default:
      throw new Error(
        `Expected reference type, received ${refTypeByte.toString(16)}`
      );
  }

  const limits = decodeResizableLimits(decoder);

  return { elementType: refType, limits };
}

function decodeResizableLimits(decoder: Decoder): ResizableLimits {
  const isMax = decodeByte(decoder);

  switch (isMax) {
    case 0x00: {
      const minimum = decodeLEB128(decoder);
      return { minimum };
    }
    case 0x01: {
      const minimum = decodeLEB128(decoder);
      const maximum = decodeLEB128(decoder);
      return { minimum, maximum };
    }
    default: {
      throw new Error(
        `Expected 0x00 or 0x01 for limits, received ${isMax.toString(16)}`
      );
    }
  }
}

// This is a separate function instead of a decodeVector
// call because it's a little inefficient to convert bytes
// to numbers then back to bytes then to a string
function decodeString(decoder: Decoder): string {
  const length = decodeLEB128(decoder);
  const strBytes = decoder.bytes.slice(decoder.index, decoder.index + length);
  const textDecoder = new TextDecoder();
  decoder.index = decoder.index + length + 1;
  return textDecoder.decode(strBytes);
}

function decodeFuncType(decoder: Decoder): FuncType {
  const funcTypeByte = decodeByte(decoder);
  if (funcTypeByte != 0x60) {
    throw new Error(
      `Func type must start with 0x60, instead found ${funcTypeByte.toString(
        16
      )}`
    );
  }

  const paramTypes = decodeVector(decoder, decodeValueType);
  const returnTypes = decodeVector(decoder, decodeValueType);

  return { paramTypes, returnTypes };
}

function decodeValueType(decoder: Decoder): ValueType {
  const valType = decodeByte(decoder);
  switch (valType) {
    case 0x7f:
      return NumType.i32;
    case 0x7e:
      return NumType.i64;
    case 0x7d:
      return NumType.f32;
    case 0x7c:
      return NumType.f64;
    case 0x70:
      return RefType.funcRef;
    case 0x6f:
      return RefType.externRef;
  }
  throw new Error(`Expected value type, received ${valType.toString(16)}`);
}
