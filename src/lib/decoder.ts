import { createModule } from './builder';
import { fromLEB128S, fromLEB128U } from './leb128';
import {
  BlockType,
  Code,
  Data,
  Element,
  ElementKind,
  Export,
  ExternalKind,
  FuncType,
  Global,
  GlobalType,
  Import,
  InstrType,
  Instruction,
  Module,
  NumType,
  OtherInstrType,
  RefType,
  ResizableLimits,
  TableType,
  ValueBlockType,
  ValueType,
} from './wasm';

interface Decoder {
  index: number;
  bytes: Uint8Array;
  view: DataView;
  decodedSections: Set<number>;
}

const SECTION_NAMES = [
  'custom',
  'types',
  'imports',
  'functions',
  'tables',
  'memories',
  'globals',
  'exports',
  'start',
  'elements',
  'code',
  'data',
  'data count',
];

export function decodeModule(encodedModule: Uint8Array) {
  const decoder: Decoder = {
    index: 0,
    bytes: encodedModule,
    view: new DataView(encodedModule.buffer),
    decodedSections: new Set(),
  };
  const module = createModule();
  decodeModulePreamble(decoder);

  while (decoder.bytes[decoder.index] !== undefined) {
    decodeSection(decoder, module);
  }

  return module;
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

// Small wrapper on fromLEB128U to mutate decoder
function decodeLEB128U(decoder: Decoder): number {
  const { index, value } = fromLEB128U(decoder.bytes, decoder.index);
  decoder.index = index;
  return value;
}

// Small wrapper on fromLEB128S to mutate decoder
function decodeLEB128S(decoder: Decoder): number {
  const { index, value } = fromLEB128S(decoder.bytes, decoder.index);
  decoder.index = index;
  return value;
}

function decodeFloat32(decoder: Decoder): number {
  const float = decoder.view.getFloat32(decoder.index, true);
  decoder.index = decoder.index + 4;

  return float;
}

function decodeFloat64(decoder: Decoder): number {
  const float = decoder.view.getFloat64(decoder.index, true);
  decoder.index = decoder.index + 8;

  return float;
}

// Get a byte without advancing index
function peekByte(decoder: Decoder): number {
  return decoder.bytes[decoder.index];
}

function decodeByte(decoder: Decoder): number {
  const byte = decoder.bytes[decoder.index];
  decoder.index += 1;
  return byte;
}

export function decodeSection(decoder: Decoder, module: Module) {
  const id = decodeByte(decoder);
  const size = decodeLEB128U(decoder);
  const startIndex = decoder.index;

  if (id !== 0) {
    if (decoder.decodedSections.has(id)) {
      throw new Error(
        `Encountered second section with id ${id}. Cannot have duplicate sections`
      );
    }
    decoder.decodedSections.add(id);
  }

  console.log(
    `DECODING ${SECTION_NAMES[id]} INDEX IS ${startIndex.toString(
      16
    )} LENGTH IS ${size}`
  );

  switch (id) {
    case 0: {
      const name = decodeString(decoder);
      const contents = decoder.bytes.slice(decoder.index, startIndex + size);
      module.customSections.push({ id: 0, name, contents });
      decoder.index = startIndex + size;
      break;
    }
    case 1: {
      module.types.items = decodeVector(decoder, decodeFuncType);
      break;
    }
    case 2: {
      module.imports.items = decodeVector(decoder, decodeImport);
      break;
    }
    case 3: {
      module.functions.items = decodeVector(decoder, decodeLEB128U);
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
      module.start = { id: 8, startFunction: decodeLEB128U(decoder) };
      break;
    }
    case 9: {
      module.elements.items = decodeVector(decoder, decodeElement);
      break;
    }
    case 10: {
      module.code.items = decodeVector(decoder, decodeCode);
      break;
    }
    case 11: {
      module.data.items = decodeVector(decoder, decodeData);
      break;
    }
    case 12: {
      const dataCount = decodeLEB128U(decoder);
      module.dataCount = { id: 12, dataCount };
      break;
    }
    default: {
      throw new Error(
        `${decoder.index.toString(16)}: Unexpected section id: ${id}`
      );
    }
  }

  if (decoder.index !== startIndex + size) {
    const actualSize = decoder.index - startIndex;
    throw new Error(
      `${SECTION_NAMES[id]} section is not ${size} bytes long, instead is ${actualSize} bytes long`
    );
  }
}

function decodeVector<T>(
  decoder: Decoder,
  decodeFn: (decoder: Decoder) => T
): T[] {
  const length = decodeLEB128U(decoder);
  const items = [];

  for (let i = 0; i < length; i++) {
    items.push(decodeFn(decoder));
  }

  return items;
}

function decodeByteVector(decoder: Decoder): Uint8Array {
  const length = decodeLEB128U(decoder);
  const bytes = decoder.bytes.slice(decoder.index, decoder.index + length);
  decoder.index = decoder.index + length + 1;

  return bytes;
}

function decodeData(decoder: Decoder): Data {
  const id = decodeByte(decoder);

  switch (id) {
    case 0x00: {
      const offsetExpr = decodeExpr(decoder);
      const bytes = decodeByteVector(decoder);

      return { id: 0x00, offsetExpr, bytes };
    }
    case 0x01: {
      const bytes = decodeByteVector(decoder);

      return { id: 0x01, bytes };
    }
    case 0x02: {
      const memoryIndex = decodeLEB128U(decoder);
      const offsetExpr = decodeExpr(decoder);
      const bytes = decodeByteVector(decoder);

      return { id: 0x02, memoryIndex, offsetExpr, bytes };
    }
    default: {
      throw new Error(`Unexpected id for data segment: ${id}`);
    }
  }
}

function decodeCode(decoder: Decoder): Code {
  const size = decodeLEB128U(decoder);
  const startIndex = decoder.index;

  const localsArray = decodeVector(decoder, (decoder) => {
    const count = decodeLEB128U(decoder);
    const type = decodeValueType(decoder);
    return { count, type };
  });

  const locals = new Map();

  for (const { count, type } of localsArray) {
    locals.set(type, count);
  }
  const codeBodySize = size - (decoder.index - startIndex);
  const code = decoder.bytes.slice(decoder.index, decoder.index + codeBodySize);

  return { locals, code };
}

function decodeElement(decoder: Decoder): Element {
  const id = decodeByte(decoder);

  switch (id) {
    case 0x00: {
      const offsetExpr = decodeExpr(decoder);
      const functionIds = decodeVector(decoder, decodeLEB128U);
      return { id: 0x00, functionIds, offsetExpr };
    }
    case 0x01: {
      const kind = decodeElementKind(decoder);
      const functionIds = decodeVector(decoder, decodeLEB128U);
      return { id: 0x01, functionIds, kind };
    }
    case 0x02: {
      const tableIndex = decodeLEB128U(decoder);
      const offsetExpr = decodeExpr(decoder);
      const kind = decodeElementKind(decoder);
      const functionIds = decodeVector(decoder, decodeLEB128U);

      return { id: 0x02, tableIndex, offsetExpr, kind, functionIds };
    }
    case 0x03: {
      const kind = decodeElementKind(decoder);
      const functionIds = decodeVector(decoder, decodeLEB128U);

      return { id: 0x03, kind, functionIds };
    }
    case 0x04: {
      const offsetExpr = decodeExpr(decoder);
      const initExprs = decodeVector(decoder, decodeExpr);

      return { id: 0x04, offsetExpr, initExprs };
    }
    case 0x05: {
      const refType = decodeRefType(decoder);
      const initExprs = decodeVector(decoder, decodeExpr);

      return { id: 0x05, refType, initExprs };
    }
    case 0x06: {
      const tableIndex = decodeLEB128U(decoder);
      const offsetExpr = decodeExpr(decoder);
      const refType = decodeRefType(decoder);
      const initExprs = decodeVector(decoder, decodeExpr);

      return { id: 0x06, tableIndex, refType, initExprs, offsetExpr };
    }
    case 0x07: {
      const refType = decodeRefType(decoder);
      const initExprs = decodeVector(decoder, decodeExpr);

      return { id: 0x07, refType, initExprs };
    }
    default: {
      throw new Error(`Unexpected element id: ${id.toString(16)}`);
    }
  }
}

function decodeElementKind(decoder: Decoder): ElementKind {
  const kind = decodeByte(decoder);

  if (kind != ElementKind.FuncRef) {
    throw new Error(`Invalid element kind: ${kind.toString(16)}`);
  }

  return kind;
}

function decodeBlockType(decoder: Decoder): BlockType {
  const type = decodeLEB128S(decoder);

  switch (type) {
    case ValueBlockType.i32:
    case ValueBlockType.i64:
    case ValueBlockType.f32:
    case ValueBlockType.f64:
    case ValueBlockType.AnyFunc:
    case ValueBlockType.Empty:
      return { valueType: type };
    default:
      if (type > 0) {
        return { typeIndex: type };
      }
      throw new Error(`Unexpected block type: ${type.toString(16)}`);
  }
}

function decodeExport(decoder: Decoder): Export {
  const name = decodeString(decoder);
  const kind = decodeByte(decoder);
  const index = decodeLEB128U(decoder);

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

function decodeInstruction(decoder: Decoder): Instruction {
  const instr = decodeByte(decoder);
  switch (instr) {
    case InstrType.Unreachable:
    case InstrType.Nop:
    case InstrType.Return:
    case InstrType.RefIsNull:
    case InstrType.Drop:
    case InstrType.Select:
      return [instr];
    case InstrType.Block:
    case InstrType.Loop: {
      const blockType = decodeBlockType(decoder);
      const block = [];

      while (peekByte(decoder) != 0x0b) {
        block.push(decodeInstruction(decoder));
      }

      return [instr, blockType, block];
    }
    case InstrType.If: {
      const blockType = decodeBlockType(decoder);
      const thenBlock = [];

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const byte = peekByte(decoder);

        if (byte === 0x0b) {
          return [instr, blockType, thenBlock, []];
        }

        if (byte === 0x05) {
          const elseBlock = [];
          while (peekByte(decoder) != 0x0b) {
            elseBlock.push(decodeInstruction(decoder));
          }
          return [instr, blockType, thenBlock, elseBlock];
        }

        thenBlock.push(decodeInstruction(decoder));
      }
    }
    case InstrType.Br:
    case InstrType.BrIf:
    case InstrType.Call:
    case InstrType.RefFunc:
    case InstrType.LocalGet:
    case InstrType.LocalSet:
    case InstrType.LocalTee:
    case InstrType.GlobalGet:
    case InstrType.GlobalSet:
    case InstrType.TableGet:
    case InstrType.TableSet: {
      const index = decodeLEB128U(decoder);
      return [instr, index];
    }
    case InstrType.Other: {
      const otherInstrType = decodeLEB128U(decoder);
      switch (otherInstrType) {
        case OtherInstrType.I32TruncSatF32S:
        case OtherInstrType.I32TruncSatF32U:
        case OtherInstrType.I32TruncSatF64S:
        case OtherInstrType.I32TruncSatF64U:
        case OtherInstrType.I64TruncSatF32S:
        case OtherInstrType.I64TruncSatF32U:
        case OtherInstrType.I64TruncSatF64S:
        case OtherInstrType.I64TruncSatF64U: {
          return [instr, otherInstrType];
        }
        case OtherInstrType.TableInit:
        case OtherInstrType.TableCopy: {
          const index1 = decodeLEB128U(decoder);
          const index2 = decodeLEB128U(decoder);
          return [instr, otherInstrType, index1, index2];
        }
        case OtherInstrType.ElemDrop:
        case OtherInstrType.TableGrow:
        case OtherInstrType.TableSize:
        case OtherInstrType.TableFill:
        case OtherInstrType.DataDrop: {
          const index = decodeLEB128U(decoder);
          return [instr, otherInstrType, index];
        }
        case OtherInstrType.MemoryCopy: {
          const byte1 = decodeByte(decoder);
          const byte2 = decodeByte(decoder);

          if (byte1 !== 0 || byte2 !== 0) {
            throw new Error(`Expected 0x00 0x00 for memory.copy instruction`);
          }

          return [instr, otherInstrType];
        }
        case OtherInstrType.MemoryFill: {
          const byte = decodeByte(decoder);

          if (byte !== 0) {
            throw new Error(`Expected 0x00 for memory.fill instruction`);
          }

          return [instr, otherInstrType];
        }
        default: {
          throw new Error(
            `Unexpected instruction: ${otherInstrType.toString(16)}`
          );
        }
      }
    }
    case InstrType.I32Load:
    case InstrType.I64Load:
    case InstrType.F32Load:
    case InstrType.F64Load:
    case InstrType.I32Load8S:
    case InstrType.I32Load8U:
    case InstrType.I32Load16S:
    case InstrType.I32Load16U:
    case InstrType.I64Load8S:
    case InstrType.I64Load8U:
    case InstrType.I64Load16S:
    case InstrType.I64Load16U:
    case InstrType.I64Load32S:
    case InstrType.I64Load32U:
    case InstrType.I32Store:
    case InstrType.I64Store:
    case InstrType.F32Store:
    case InstrType.F64Store:
    case InstrType.I32Store8:
    case InstrType.I32Store16:
    case InstrType.I64Store8:
    case InstrType.I64Store16:
    case InstrType.I64Store32:
    case InstrType.CallIndirect: {
      const index1 = decodeLEB128U(decoder);
      const index2 = decodeLEB128U(decoder);
      return [instr, index1, index2];
    }
    case InstrType.BrTable: {
      const labels = decodeVector(decoder, decodeLEB128U);
      const defaultLabel = decodeLEB128U(decoder);

      return [instr, ...labels, defaultLabel];
    }
    case InstrType.RefNull: {
      const refType = decodeRefType(decoder);
      return [instr, refType];
    }
    case InstrType.SelectT: {
      const types = decodeVector(decoder, decodeValueType);
      return [instr, ...types];
    }
    case InstrType.MemorySize: {
      const byte = decodeByte(decoder);
      if (byte !== 0x00) {
        throw new Error(`Expected 0x00 after 0x3f for memory.size instruction`);
      }
      return [instr];
    }
    case InstrType.MemoryGrow: {
      const byte = decodeByte(decoder);
      if (byte !== 0x00) {
        throw new Error(`Expected 0x00 after 0x40 for memory.grow instruction`);
      }
      return [instr];
    }
    case InstrType.I32Const:
    case InstrType.I64Const: {
      // TODO: Add a max length parameter to decodeLEB128 functions
      // and error if int exceeds it
      const int = decodeLEB128S(decoder);
      return [instr, int];
    }
    case InstrType.F32Const: {
      const int = decodeFloat32(decoder);
      return [instr, int];
    }
    case InstrType.F64Const: {
      const int = decodeFloat64(decoder);
      return [instr, int];
    }
    default:
      if (instr >= InstrType.I32EqZ && instr <= InstrType.I64Extend32S) {
        return [instr];
      }
  }
  throw new Error(`Unexpected instruction: ${instr.toString(16)}`);
}

function decodeExpr(decoder: Decoder): Uint8Array {
  let i = decoder.index;
  const opcodes = [];

  while (decoder.bytes[i] !== 0x0b) {
    if (decoder.bytes[i] === undefined) {
      throw new Error(
        `Reached end of program without finding end of expression (0x0b)`
      );
    }
    opcodes.push(decoder.bytes[i]);
    i += 1;
  }

  return opcodes;
}

function decodeImport(decoder: Decoder): Import {
  const module = decodeString(decoder);
  const field = decodeString(decoder);
  const kind = decodeByte(decoder);

  switch (kind) {
    case 0x00: {
      const typeIndex = decodeLEB128U(decoder);
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
      const minimum = decodeLEB128U(decoder);
      return { minimum };
    }
    case 0x01: {
      const minimum = decodeLEB128U(decoder);
      const maximum = decodeLEB128U(decoder);
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
  const length = decodeLEB128U(decoder);
  const strBytes = decoder.bytes.slice(decoder.index, decoder.index + length);
  const textDecoder = new TextDecoder();
  decoder.index = decoder.index + length;
  return textDecoder.decode(strBytes);
}

function decodeFuncType(decoder: Decoder): FuncType {
  const funcTypeByte = decodeByte(decoder);
  if (funcTypeByte != 0x60) {
    throw new Error(
      `${(decoder.index - 1).toString(
        16
      )} Func type must start with 0x60, instead found ${funcTypeByte.toString(
        16
      )}`
    );
  }

  const paramTypes = decodeVector(decoder, decodeValueType);
  const returnTypes = decodeVector(decoder, decodeValueType);

  return { paramTypes, returnTypes };
}

function decodeRefType(decoder: Decoder): RefType {
  const refType = decodeByte(decoder);

  switch (refType) {
    case 0x70:
      return RefType.funcRef;
    case 0x6f:
      return RefType.externRef;
    default:
      throw new Error(`Expected ref type, received ${refType.toString(16)}`);
  }
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
