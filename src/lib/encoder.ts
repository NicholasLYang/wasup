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
  ValueType,
} from './wasm';

export function encodeModule(module: Module): Uint8Array {
  const output = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];

  if (module.types.items.length > 0) {
    output.push(...encodeTypeSection(module.types));
  }

  if (module.imports.items.length > 0) {
    output.push(...encodeImportSection(module.imports));
  }

  if (module.functions.items.length > 0) {
    output.push(...encodeFunctionSection(module.functions));
  }

  if (module.tables.items.length > 0) {
    output.push(...encodeTableSection(module.tables));
  }

  if (module.memories.items.length > 0) {
    output.push(...encodeMemorySection(module.memories));
  }

  if (module.globals.items.length > 0) {
    output.push(...encodeGlobalSection(module.globals));
  }

  if (module.exports.items.length > 0) {
    output.push(...encodeExportSection(module.exports));
  }

  if (module.start) {
    output.push(...encodeStartSection(module.start));
  }

  if (module.elements.items.length > 0) {
    output.push(...encodeElementSection(module.elements));
  }

  if (module.code.items.length > 0) {
    output.push(...encodeCodeSection(module.code));
  }

  if (module.data.items.length > 0) {
    output.push(...encodeDataSection(module.data));
  }

  if (module.dataCount) {
    output.push(...encodeDataCountSection(module.dataCount));
  }

  const byteArray = new Uint8Array(output.length);
  for (let i = 0; i < output.length; i++) {
    byteArray[i] = output[i];
  }

  return byteArray;
}

function encodeSection<T extends Section<Id, Item>, Id extends number, Item>(
  section: T,
  encodeFn: (item: Item) => number[]
): number[] {
  const output: number[] = [section.id];
  // We push to this temporary array cause we need the size of the
  // section content
  const sectionContent = [];

  sectionContent.push(...toUnsignedLEB128(section.items.length));

  for (const item of section.items) {
    sectionContent.push(...encodeFn(item));
  }

  output.push(...toUnsignedLEB128(sectionContent.length));
  output.push(...sectionContent);

  return output;
}

export function encodeTypeSection(typeSection: TypeSection): number[] {
  return encodeSection(typeSection, encodeFuncType);
}

export function encodeImportSection(importSection: ImportSection): number[] {
  return encodeSection(importSection, encodeImportEntry);
}

export function encodeFunctionSection(
  functionSection: FunctionSection
): number[] {
  return encodeSection(functionSection, toUnsignedLEB128);
}

export function encodeTableSection(tableSection: TableSection): number[] {
  return encodeSection(tableSection, encodeTableType);
}

export function encodeMemorySection(memorySection: MemorySection): number[] {
  return encodeSection(memorySection, encodeResizableLimits);
}

export function encodeGlobalSection(globalSection: GlobalSection): number[] {
  return encodeSection(globalSection, encodeGlobal);
}

export function encodeExportSection(exportSection: ExportSection): number[] {
  return encodeSection(exportSection, encodeExport);
}

export function encodeStartSection(startSection: StartSection): number[] {
  const startId = toUnsignedLEB128(startSection.startFunction);
  return [startSection.id, ...toUnsignedLEB128(startId.length), ...startId];
}

export function encodeElementSection(elementSection: ElementSection): number[] {
  return encodeSection(elementSection, encodeElement);
}

export function encodeCodeSection(codeSection: CodeSection): number[] {
  return encodeSection(codeSection, encodeCode);
}

export function encodeDataSection(dataSection: DataSection): number[] {
  return encodeSection(dataSection, encodeData);
}

export function encodeDataCountSection(
  dataCountSection: DataCountSection
): number[] {
  const dataCount = toUnsignedLEB128(dataCountSection.dataCount);
  return [
    dataCountSection.id,
    ...toUnsignedLEB128(dataCount.length),
    ...dataCount,
  ];
}

function encodeData(data: Data): number[] {
  switch (data.id) {
    case 0x00:
      return [
        0x00,
        ...data.offsetExpr,
        0x0b,
        ...toUnsignedLEB128(data.bytes.length),
        ...data.bytes,
      ];
    case 0x01:
      return [0x01, ...toUnsignedLEB128(data.bytes.length), ...data.bytes];
    case 0x02:
      return [
        0x02,
        ...toUnsignedLEB128(data.memoryIndex),
        ...data.offsetExpr,
        0x0b,
        ...toUnsignedLEB128(data.bytes.length),
        ...data.bytes,
      ];
  }
}

function encodeCode(code: Code): number[] {
  const funcBody = encodeVec([...code.locals], ([varType, count]) => {
    const output = toUnsignedLEB128(count);
    output.push(varType);
    return output;
  });

  funcBody.push(...code.code);
  funcBody.push(0x0b);

  return [...toUnsignedLEB128(funcBody.length), ...funcBody];
}

function encodeElement(element: Element): number[] {
  switch (element.id) {
    case 0x00:
      return [
        0x00,
        ...element.offsetExpr,
        0x0b,
        ...encodeVec(element.functionIds, toUnsignedLEB128),
      ];
    case 0x01:
      return [
        0x01,
        element.kind,
        ...encodeVec(element.functionIds, toUnsignedLEB128),
      ];
    case 0x02:
      return [
        0x02,
        ...toUnsignedLEB128(element.tableIndex),
        ...element.offsetExpr,
        0x0b,
        element.kind,
        ...encodeVec(element.functionIds, toUnsignedLEB128),
      ];
    case 0x03:
      return [
        0x03,
        element.kind,
        ...encodeVec(element.functionIds, toUnsignedLEB128),
      ];
    case 0x04:
      return [
        0x04,
        ...element.offsetExpr,
        0x0b,
        ...encodeVec(element.initExprs, (e) => [...e, 0x0b]),
      ];
    case 0x05:
      return [
        0x05,
        element.refType,
        ...encodeVec(element.initExprs, (e) => [...e, 0x0b]),
      ];
    case 0x06:
      return [
        0x06,
        ...toUnsignedLEB128(element.tableIndex),
        ...element.offsetExpr,
        0x0b,
        element.refType,
        ...encodeVec(element.initExprs, (e) => [...e, 0x0b]),
      ];
    case 0x07:
      return [
        0x07,
        element.refType,
        ...encodeVec(element.initExprs, (e) => [...e, 0x0b]),
      ];
  }
}

function encodeExport(exportEntry: Export): number[] {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(exportEntry.name);
  const output = toUnsignedLEB128(nameBytes.length);
  output.push(...nameBytes);
  output.push(exportEntry.kind);
  output.push(...toUnsignedLEB128(exportEntry.index));

  return output;
}

function encodeFuncType(type: FuncType): number[] {
  const output = [0x60];
  output.push(...encodeVec(type.paramTypes, (t: ValueType) => [t]));
  output.push(...encodeVec(type.returnTypes, (t: ValueType) => [t]));

  return output;
}

function encodeImportEntry(importEntry: Import): number[] {
  const encoder = new TextEncoder();
  const moduleBytes = encoder.encode(importEntry.module);
  const output = toUnsignedLEB128(moduleBytes.length);
  output.push(...moduleBytes);
  const fieldBytes = encoder.encode(importEntry.field);
  output.push(...toUnsignedLEB128(fieldBytes.length));
  output.push(...fieldBytes);
  output.push(importEntry.description.kind);

  switch (importEntry.description.kind) {
    case ExternalKind.Function:
      output.push(...toUnsignedLEB128(importEntry.description.typeIndex));
      return output;
    case ExternalKind.Table:
      output.push(...encodeTableType(importEntry.description.tableType));
      return output;
    case ExternalKind.Memory:
      output.push(...encodeResizableLimits(importEntry.description.memoryType));
      return output;
    case ExternalKind.Global:
      output.push(...encodeGlobalType(importEntry.description.globalType));
      return output;
  }
}

function encodeGlobal(global: Global): number[] {
  return [...encodeGlobalType(global.type), ...global.initExpr, 0x0b];
}

function encodeGlobalType(globalType: GlobalType): number[] {
  return [globalType.type, globalType.mutability ? 1 : 0];
}

function encodeTableType(tableType: TableType): number[] {
  const output: number[] = [tableType.elementType];
  output.push(...encodeResizableLimits(tableType.limits));
  return output;
}

function encodeResizableLimits(resizableLimits: ResizableLimits): number[] {
  if (resizableLimits.maximum) {
    return [
      0x01,
      ...toUnsignedLEB128(resizableLimits.minimum),
      ...toUnsignedLEB128(resizableLimits.maximum),
    ];
  }
  return [0x00, ...toUnsignedLEB128(resizableLimits.minimum)];
}

function encodeVec<T>(vec: T[], encodeFn: (e: T) => number[]): number[] {
  const output = toUnsignedLEB128(vec.length);
  output.push(...vec.flatMap((e) => encodeFn(e)));
  return output;
}
