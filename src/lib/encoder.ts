import { toUnsignedLEB128 } from './leb128';
import {
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
  MemorySection,
  Module,
  ResizableLimits,
  Section,
  StartSection,
  TableSection,
  TableType,
  TypeSection,
} from './wasm';
import { getModuleSize, SizeInfo } from './size';

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

function encodeLEB128U(encoder: Encoder, int: number) {
  encoder.index = toUnsignedLEB128(int, encoder.buffer, encoder.index);
}

function encodeByte(encoder: Encoder, byte: number) {
  if (encoder.index >= encoder.buffer.length) {
    throw new Error(`Internal: Buffer is not big enough`);
  }
  encoder.buffer[encoder.index] = byte;
  encoder.index += 1;
}

export function encodeModule(module: Module): Uint8Array {
  const encoder = createEncoder(module);
  encodePreamble(encoder);

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

  if (module.code.items.length > 0) {
    encodeCodeSection(encoder, module.code);
  }

  if (module.data.items.length > 0) {
    encodeDataSection(encoder, module.data);
  }

  if (module.dataCount) {
    encodeDataCountSection(encoder, module.dataCount);
  }

  return encoder.buffer;
}

function buf2hex(buffer: Uint8Array): string {
  // buffer is an ArrayBuffer
  return [...buffer].map((x) => x.toString(16).padStart(2, '0')).join(', ');
}

function encodeSection<T extends Section<Id, Item>, Id extends number, Item>(
  encoder: Encoder,
  section: T,
  sectionSize: number,
  encodeFn: (encoder: Encoder, item: Item) => void
) {
  const startIndex = encoder.index;
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
    encoder.sizeInfo.sections.types!,
    encodeFuncType
  );
}

export function encodeImportSection(
  encoder: Encoder,
  importSection: ImportSection
) {
  encodeSection(
    encoder,
    importSection,
    encoder.sizeInfo.sections.imports!,
    encodeImportEntry
  );
}

export function encodeFunctionSection(
  encoder: Encoder,
  functionSection: FunctionSection
) {
  encodeSection(
    encoder,
    functionSection,
    encoder.sizeInfo.sections.functions!,
    encodeLEB128U
  );
}

export function encodeTableSection(
  encoder: Encoder,
  tableSection: TableSection
) {
  encodeSection(
    encoder,
    tableSection,
    encoder.sizeInfo.sections.tables!,
    encodeTableType
  );
}

export function encodeMemorySection(
  encoder: Encoder,
  memorySection: MemorySection
) {
  return encodeSection(
    encoder,
    memorySection,
    encoder.sizeInfo.sections.memories!,
    encodeResizableLimits
  );
}

export function encodeGlobalSection(
  encoder: Encoder,
  globalSection: GlobalSection
) {
  return encodeSection(
    encoder,
    globalSection,
    encoder.sizeInfo.sections.globals!,
    encodeGlobal
  );
}

export function encodeExportSection(
  encoder: Encoder,
  exportSection: ExportSection
) {
  return encodeSection(
    encoder,
    exportSection,
    encoder.sizeInfo.sections.exports!,
    encodeExport
  );
}

export function encodeStartSection(
  encoder: Encoder,
  startSection: StartSection
) {
  encodeByte(encoder, startSection.id);
  encodeLEB128U(encoder, encoder.sizeInfo.sections.start!);
  encodeLEB128U(encoder, startSection.startFunction);
}

export function encodeElementSection(
  encoder: Encoder,
  elementSection: ElementSection
) {
  return encodeSection(
    encoder,
    elementSection,
    encoder.sizeInfo.sections.elements!,
    encodeElement
  );
}

export function encodeCodeSection(encoder: Encoder, codeSection: CodeSection) {
  return encodeSection(
    encoder,
    codeSection,
    encoder.sizeInfo.sections.code!,
    encodeCode
  );
}

export function encodeDataSection(encoder: Encoder, dataSection: DataSection) {
  return encodeSection(
    encoder,
    dataSection,
    encoder.sizeInfo.sections.data!,
    encodeData
  );
}

export function encodeDataCountSection(
  encoder: Encoder,
  dataCountSection: DataCountSection
) {
  encodeByte(encoder, dataCountSection.id);
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
  encodeVec(encoder, [...code.locals], (encoder, [varType, count]) => {
    encodeLEB128U(encoder, count);
    encodeByte(encoder, varType);
  });

  encodeExpr(encoder, code.code);
}

function encodeElement(encoder: Encoder, element: Element) {
  encodeByte(encoder, element.id);

  switch (element.id) {
    case 0x00:
      encodeExpr(encoder, element.offsetExpr);
      encodeVec(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x01:
      encodeByte(encoder, element.kind);
      encodeVec(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x02:
      encodeLEB128U(encoder, element.tableIndex);
      encodeExpr(encoder, element.offsetExpr);
      encodeByte(encoder, element.kind);
      encodeVec(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x03:
      encodeByte(encoder, element.kind);
      encodeVec(encoder, element.functionIds, encodeLEB128U);
      break;
    case 0x04:
      encodeExpr(encoder, element.offsetExpr);
      encodeVec(encoder, element.initExprs, encodeExpr);
      break;
    case 0x05:
      encodeByte(encoder, element.refType);
      encodeVec(encoder, element.initExprs, encodeExpr);
      break;
    case 0x06:
      encodeLEB128U(encoder, element.tableIndex);
      encodeExpr(encoder, element.offsetExpr);
      encodeByte(encoder, element.refType);
      encodeVec(encoder, element.initExprs, encodeExpr);
      break;
    case 0x07:
      encodeByte(encoder, element.refType);
      encodeVec(encoder, element.initExprs, encodeExpr);
  }
}

function encodeExport(encoder: Encoder, exportEntry: Export) {
  const nameBytes = encoder.textEncoder.encode(exportEntry.name);
  encodeLEB128U(encoder, nameBytes.length);
  encodeByteArray(encoder, nameBytes);
  encodeByte(encoder, exportEntry.kind);
  encodeLEB128U(encoder, exportEntry.index);
}

function encodeFuncType(encoder: Encoder, type: FuncType) {
  const startIndex = encoder.index;
  console.log('BEFORE');
  console.log(buf2hex(encoder.buffer.slice(startIndex, startIndex + 10)));
  encodeByte(encoder, 0x60);
  encodeVec(encoder, type.paramTypes, encodeByte);
  encodeVec(encoder, type.returnTypes, encodeByte);
  console.log('AFTER');
  console.log(buf2hex(encoder.buffer.slice(startIndex, startIndex + 10)));
}

function encodeByteArray(encoder: Encoder, bytes: Uint8Array) {
  for (let i = 0; i < bytes.length; i++) {
    encoder.buffer[encoder.index] = bytes[i];
    encoder.index += 1;
  }
}

function encodeImportEntry(encoder: Encoder, importEntry: Import) {
  const textEncoder = new TextEncoder();
  const startIndex = encoder.index;
  const moduleBytes = textEncoder.encode(importEntry.module);
  encodeLEB128U(encoder, moduleBytes.length);
  encodeByteArray(encoder, moduleBytes);

  const fieldBytes = textEncoder.encode(importEntry.field);
  encodeLEB128U(encoder, fieldBytes.length);
  encodeByteArray(encoder, fieldBytes);
  console.log('1');
  console.log(buf2hex(encoder.buffer.slice(startIndex, startIndex + 20)));
  encodeByte(encoder, importEntry.description.kind);
  console.log('2');
  console.log(buf2hex(encoder.buffer.slice(startIndex, startIndex + 20)));
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
  encodeByte(encoder, 0x0b);
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
  resizableLimits: ResizableLimits
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
  encodeByte(encoder, 0x0b);
}

function encodeVec<T>(
  encoder: Encoder,
  vec: T[],
  encodeFn: (encoder: Encoder, e: T) => void
) {
  encodeLEB128U(encoder, vec.length);
  for (const elem of vec) {
    encodeFn(encoder, elem);
  }
}
