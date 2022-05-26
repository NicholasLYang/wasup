import { getLEB128USize, toLEB128S, toLEB128U } from './leb128';
import { getCodeSize, getModuleSize, SizeInfo } from './size';
import {
  BlockType,
  Code,
  CodeSection,
  Data,
  DataCountSection,
  DataSection,
  Element,
  ElementSection,
  Export,
  ExportSection,
  Expr,
  ExternalKind,
  FunctionSection,
  FuncType,
  Global,
  GlobalSection,
  GlobalType,
  Import,
  ImportSection,
  InstrType,
  Instruction,
  MemorySection,
  Module,
  OtherInstrType,
  ResizableLimits,
  Section,
  StartSection,
  TableSection,
  TableType,
  TypeSection,
} from './wasm';

interface Encoder {
  buffer: Uint8Array;
  index: number;
  textEncoder: TextEncoder;
  sizeInfo: SizeInfo;
}

export function createEncoder(module: Module): Encoder {
  const sizeInfo = getModuleSize(module);
  const buffer = new Uint8Array(sizeInfo.total);

  return {
    buffer,
    sizeInfo,
    index: 0,
    textEncoder: new TextEncoder(),
  };
}

function encodePreamble(encoder: Encoder) {
  encoder.buffer[0] = 0x00;
  encoder.buffer[1] = 0x61;
  encoder.buffer[2] = 0x73;
  encoder.buffer[3] = 0x6d;
  encoder.buffer[4] = 0x01;
  encoder.buffer[5] = 0x00;
  encoder.buffer[6] = 0x00;
  encoder.buffer[7] = 0x00;

  encoder.index = 8;
}

function encodeLEB128S(encoder: Encoder, int: number) {
  encoder.index = toLEB128S(int, encoder.buffer, encoder.index);
}

function encodeLEB128U(encoder: Encoder, int: number) {
  encoder.index = toLEB128U(int, encoder.buffer, encoder.index);
}

function encodeFloat32(encoder: Encoder, float: number) {
  const floatArray = new Float32Array(1);
  floatArray[0] = float;
  const byteArray = new Uint8Array(floatArray.buffer);
  encoder.buffer[encoder.index] = byteArray[0];
  encoder.buffer[encoder.index + 1] = byteArray[1];
  encoder.buffer[encoder.index + 2] = byteArray[2];
  encoder.buffer[encoder.index + 3] = byteArray[3];
  encoder.index = encoder.index + 4;
}

function encodeFloat64(encoder: Encoder, float: number) {
  const floatArray = new Float64Array(1);
  floatArray[0] = float;
  const byteArray = new Uint8Array(floatArray.buffer);
  encoder.buffer[encoder.index] = byteArray[0];
  encoder.buffer[encoder.index + 1] = byteArray[1];
  encoder.buffer[encoder.index + 2] = byteArray[2];
  encoder.buffer[encoder.index + 3] = byteArray[3];
  encoder.buffer[encoder.index + 4] = byteArray[4];
  encoder.buffer[encoder.index + 5] = byteArray[5];
  encoder.buffer[encoder.index + 6] = byteArray[6];
  encoder.buffer[encoder.index + 7] = byteArray[7];
  encoder.index = encoder.index + 8;
}

function encodeByte(encoder: Encoder, byte: number) {
  if (encoder.index >= encoder.buffer.length) {
    throw new Error(
      `Internal: Buffer is not big enough, tried to encode ${byte} ${encoder.buffer}`,
    );
  }
  encoder.buffer[encoder.index] = byte;
  encoder.index += 1;
}

export function encodeModule(module: Module): Uint8Array {
  const encoder = createEncoder(module);
  encodePreamble(encoder);

  for (const customSection of module.customSections) {
    encodeByte(encoder, 0);
    const nameBytes = encoder.textEncoder.encode(customSection.name);
    const length =
      getLEB128USize(nameBytes.length) +
      nameBytes.length +
      customSection.contents.length;
    encodeLEB128U(encoder, length);
    encodeLEB128U(encoder, nameBytes.length);
    encodeByteArray(encoder, nameBytes);
    encodeByteArray(encoder, customSection.contents);
  }

  if (module.types.items.length > 0) {
    encodeTypeSection(encoder, module.types);
  }

  if (module.imports.items.length > 0) {
    encodeImportSection(encoder, module.imports);
  }

  if (module.functions.items.length > 0) {
    encodeFunctionSection(encoder, module.functions);
  }

  if (module.tables.items.length > 0) {
    encodeTableSection(encoder, module.tables);
  }

  if (module.memories.items.length > 0) {
    encodeMemorySection(encoder, module.memories);
  }

  if (module.globals.items.length > 0) {
    encodeGlobalSection(encoder, module.globals);
  }

  if (module.exports.items.length > 0) {
    encodeExportSection(encoder, module.exports);
  }

  if (module.start) {
    encodeStartSection(encoder, module.start);
  }

  if (module.elements.items.length > 0) {
    encodeElementSection(encoder, module.elements);
  }

  if (module.dataCount) {
    encodeDataCountSection(encoder, module.dataCount);
  }

  if (module.code.items.length > 0) {
    encodeCodeSection(encoder, module.code);
  }

  if (module.data.items.length > 0) {
    encodeDataSection(encoder, module.data);
  }

  return encoder.buffer;
}

function encodeSection<
  T extends Section<Id, Item>,
  Id extends number,
  Item,
>(
  encoder: Encoder,
  section: T,
  sectionSize: number,
  encodeFn: (encoder: Encoder, item: Item) => void,
) {
  encodeByte(encoder, section.id);
  encodeLEB128U(encoder, sectionSize);
  encodeLEB128U(encoder, section.items.length);
  for (const item of section.items) {
    encodeFn(encoder, item);
  }
}

export function encodeTypeSection(encoder: Encoder, typeSection: TypeSection) {
  encodeSection(
    encoder,
    typeSection,
    encoder.sizeInfo.sections.types,
    encodeFuncType,
  );
}

export function encodeImportSection(
  encoder: Encoder,
  importSection: ImportSection,
) {
  encodeSection(
    encoder,
    importSection,
    encoder.sizeInfo.sections.imports,
    encodeImportEntry,
  );
}

export function encodeFunctionSection(
  encoder: Encoder,
  functionSection: FunctionSection,
) {
  encodeSection(
    encoder,
    functionSection,
    encoder.sizeInfo.sections.functions,
    encodeLEB128U,
  );
}

export function encodeTableSection(
  encoder: Encoder,
  tableSection: TableSection,
) {
  encodeSection(
    encoder,
    tableSection,
    encoder.sizeInfo.sections.tables,
    encodeTableType,
  );
}

export function encodeMemorySection(
  encoder: Encoder,
  memorySection: MemorySection,
) {
  return encodeSection(
    encoder,
    memorySection,
    encoder.sizeInfo.sections.memories,
    encodeResizableLimits,
  );
}

export function encodeGlobalSection(
  encoder: Encoder,
  globalSection: GlobalSection,
) {
  return encodeSection(
    encoder,
    globalSection,
    encoder.sizeInfo.sections.globals,
    encodeGlobal,
  );
}

export function encodeExportSection(
  encoder: Encoder,
  exportSection: ExportSection,
) {
  return encodeSection(
    encoder,
    exportSection,
    encoder.sizeInfo.sections.exports,
    encodeExport,
  );
}

export function encodeStartSection(
  encoder: Encoder,
  startSection: StartSection,
) {
  encodeByte(encoder, startSection.id);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  encodeLEB128U(encoder, encoder.sizeInfo.sections.start!);
  encodeLEB128U(encoder, startSection.startFunction);
}

export function encodeElementSection(
  encoder: Encoder,
  elementSection: ElementSection,
) {
  return encodeSection(
    encoder,
    elementSection,
    encoder.sizeInfo.sections.elements,
    encodeElement,
  );
}

export function encodeCodeSection(encoder: Encoder, codeSection: CodeSection) {
  return encodeSection(
    encoder,
    codeSection,
    encoder.sizeInfo.sections.code,
    encodeCode,
  );
}

export function encodeDataSection(encoder: Encoder, dataSection: DataSection) {
  return encodeSection(
    encoder,
    dataSection,
    encoder.sizeInfo.sections.data,
    encodeData,
  );
}

export function encodeDataCountSection(
  encoder: Encoder,
  dataCountSection: DataCountSection,
) {
  encodeByte(encoder, dataCountSection.id);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  encodeLEB128U(encoder, encoder.sizeInfo.sections.dataCount!);
  encodeLEB128U(encoder, dataCountSection.dataCount);
}

function encodeData(encoder: Encoder, data: Data) {
  encodeByte(encoder, data.id);

  switch (data.id) {
    case 0x00:
      encodeExpr(encoder, data.offsetExpr);
      break;
    case 0x01:
      break;
    case 0x02:
      encodeLEB128U(encoder, data.memoryIndex);
      encodeExpr(encoder, data.offsetExpr);
  }

  encodeLEB128U(encoder, data.bytes.length);
  encodeByteArray(encoder, data.bytes);
}

function encodeCode(encoder: Encoder, code: Code) {
  const codeBodySize = getCodeSize(code);

  encodeLEB128U(encoder, codeBodySize);
  encodeVector(
    encoder,
    code.locals,
    (encoder, { type, count }) => {
      encodeLEB128U(encoder, count);
      encodeByte(encoder, type);
    },
  );

  encodeExpr(encoder, code.code);
}

function encodeElement(encoder: Encoder, element: Element) {
  encodeByte(encoder, element.id);

  switch (element.id) {
    case 0x00:
      encodeExpr(encoder, element.offsetExpr);
      encodeVector(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x01:
      encodeByte(encoder, element.kind);
      encodeVector(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x02:
      encodeLEB128U(encoder, element.tableIndex);
      encodeExpr(encoder, element.offsetExpr);
      encodeByte(encoder, element.kind);
      encodeVector(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x03:
      encodeByte(encoder, element.kind);
      encodeVector(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x04:
      encodeExpr(encoder, element.offsetExpr);
      encodeVector(encoder, element.initExprs, encodeExpr);
      break;
    case 0x05:
      encodeByte(encoder, element.refType);
      encodeVector(encoder, element.initExprs, encodeExpr);
      break;
    case 0x06:
      encodeLEB128U(encoder, element.tableIndex);
      encodeExpr(encoder, element.offsetExpr);
      encodeByte(encoder, element.refType);
      encodeVector(encoder, element.initExprs, encodeExpr);
      break;
    case 0x07:
      encodeByte(encoder, element.refType);
      encodeVector(encoder, element.initExprs, encodeExpr);
  }
}

function encodeString(encoder: Encoder, s: string) {
  const bytes = encoder.textEncoder.encode(s);
  encodeLEB128U(encoder, bytes.length);
  encodeByteArray(encoder, bytes);
}

function encodeExport(encoder: Encoder, exportEntry: Export) {
  encodeString(encoder, exportEntry.name);
  encodeByte(encoder, exportEntry.kind);
  encodeLEB128U(encoder, exportEntry.index);
}

function encodeFuncType(encoder: Encoder, type: FuncType) {
  encodeByte(encoder, 0x60);
  encodeVector(encoder, type.paramTypes, encodeByte);
  encodeVector(encoder, type.returnTypes, encodeByte);
}

function encodeByteArray(encoder: Encoder, bytes: Uint8Array) {
  for (let i = 0; i < bytes.length; i++) {
    encoder.buffer[encoder.index] = bytes[i];
    encoder.index += 1;
  }
}

function encodeImportEntry(encoder: Encoder, importEntry: Import) {
  encodeString(encoder, importEntry.module);
  encodeString(encoder, importEntry.field);
  encodeByte(encoder, importEntry.description.kind);

  switch (importEntry.description.kind) {
    case ExternalKind.Function:
      encodeLEB128U(encoder, importEntry.description.typeIndex);
      break;
    case ExternalKind.Table:
      encodeTableType(encoder, importEntry.description.tableType);
      break;
    case ExternalKind.Memory:
      encodeResizableLimits(encoder, importEntry.description.memoryType);
      break;
    case ExternalKind.Global:
      encodeGlobalType(encoder, importEntry.description.globalType);
      break;
  }
}

function encodeGlobal(encoder: Encoder, global: Global) {
  encodeGlobalType(encoder, global.type);
  encodeExpr(encoder, global.initExpr);
}

function encodeGlobalType(encoder: Encoder, globalType: GlobalType) {
  encodeByte(encoder, globalType.type);
  encodeByte(encoder, globalType.mutability ? 1 : 0);
}

function encodeTableType(encoder: Encoder, tableType: TableType) {
  encodeByte(encoder, tableType.elementType);
  encodeResizableLimits(encoder, tableType.limits);
}

function encodeResizableLimits(
  encoder: Encoder,
  resizableLimits: ResizableLimits,
) {
  if (resizableLimits.maximum) {
    encodeByte(encoder, 0x01);
    encodeLEB128U(encoder, resizableLimits.minimum);
    encodeLEB128U(encoder, resizableLimits.maximum);
  } else {
    encodeByte(encoder, 0x00);
    encodeLEB128U(encoder, resizableLimits.minimum);
  }
}

function encodeExpr(encoder: Encoder, expr: Expr) {
  for (const instr of expr) {
    encodeInstruction(encoder, instr);
  }
  encodeByte(encoder, 0x0b);
}

function encodeVector<
  T,
>(encoder: Encoder, vec: T[], encodeFn: (encoder: Encoder, e: T) => void) {
  encodeLEB128U(encoder, vec.length);
  for (const elem of vec) {
    encodeFn(encoder, elem);
  }
}

function encodeBlockType(encoder: Encoder, blockType: BlockType) {
  if ('valueType' in blockType) {
    encodeLEB128S(encoder, blockType.valueType);
  } else if ('typeIndex' in blockType) {
    encodeLEB128S(encoder, blockType.typeIndex);
  }
}

export function encodeInstruction(encoder: Encoder, instr: Instruction) {
  encodeByte(encoder, instr[0]);
  switch (instr[0]) {
    case InstrType.Block:
    case InstrType.Loop: {
      encodeBlockType(encoder, instr[1]);
      encodeExpr(encoder, instr[2]);
      break;
    }
    case InstrType.If: {
      encodeBlockType(encoder, instr[1]);
      // No else
      if (instr.length === 3) {
        encodeExpr(encoder, instr[2]);
      } else if (instr.length === 4) {
        // Can't call encodeExpr here cause it doesn't end in 0x05
        for (const i of instr[2]) {
          encodeInstruction(encoder, i);
        }
        encodeByte(encoder, 0x05);
        encodeExpr(encoder, instr[3]);
      }
      break;
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
      encodeLEB128U(encoder, instr[1]);
      break;
    }
    case InstrType.Other: {
      encodeLEB128U(encoder, instr[1]);
      switch (instr[1]) {
        case OtherInstrType.TableInit:
        case OtherInstrType.TableCopy: {
          encodeLEB128U(encoder, instr[2]);
          encodeLEB128U(encoder, instr[3]);
          break;
        }
        case OtherInstrType.ElemDrop:
        case OtherInstrType.TableGrow:
        case OtherInstrType.TableSize:
        case OtherInstrType.TableFill:
        case OtherInstrType.DataDrop: {
          encodeLEB128U(encoder, instr[2]);
          break;
        }
        case OtherInstrType.MemoryCopy: {
          encodeByte(encoder, 0x00);
          encodeByte(encoder, 0x00);
          break;
        }
        case OtherInstrType.MemoryFill: {
          encodeByte(encoder, 0x00);
          break;
        }
        case OtherInstrType.I32TruncSatF32S:
        case OtherInstrType.I32TruncSatF32U:
        case OtherInstrType.I32TruncSatF64S:
        case OtherInstrType.I32TruncSatF64U:
        case OtherInstrType.I64TruncSatF32S:
        case OtherInstrType.I64TruncSatF32U:
        case OtherInstrType.I64TruncSatF64S:
        case OtherInstrType.I64TruncSatF64U: {
          break;
        }
        default: {
          throw new Error(`Unexpected instruction: ${instr[1].toString(16)}`);
        }
      }
      break;
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
      encodeLEB128U(encoder, instr[1]);
      encodeLEB128U(encoder, instr[2]);
      break;
    }
    case InstrType.BrTable: {
      encodeVector(encoder, instr[1], encodeLEB128U);
      encodeLEB128U(encoder, instr[2]);
      break;
    }
    case InstrType.RefNull: {
      encodeByte(encoder, instr[1]);
      break;
    }
    case InstrType.SelectT: {
      encodeVector(encoder, instr[1], encodeByte);
      break;
    }
    case InstrType.MemorySize:
    case InstrType.MemoryGrow: {
      encodeByte(encoder, 0x00);
      break;
    }
    case InstrType.I32Const:
    case InstrType.I64Const: {
      encodeLEB128S(encoder, instr[1]);
      break;
    }
    case InstrType.F32Const: {
      encodeFloat32(encoder, instr[1]);
      break;
    }
    case InstrType.F64Const: {
      encodeFloat64(encoder, instr[1]);
      break;
    }
  }
}
