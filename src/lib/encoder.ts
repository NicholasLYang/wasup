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
  ImportEntry,
  ImportSection,
  MemorySection,
  Module,
  ResizableLimits,
  StartSection,
  TableSection,
  TableType,
  TypeSection,
  ValueType,
} from './wasm';

export function encodeModule(module: Module) {
  const output = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];

  if (module.types) {
    output.push(...encodeTypeSection(module.types));
  }

  if (module.imports) {
    output.push(...encodeImportSection(module.imports));
  }

  if (module.functions) {
    output.push(...encodeFunctionSection(module.functions));
  }

  if (module.tables) {
    output.push(...encodeTableSection(module.tables));
  }

  if (module.memories) {
    output.push(...encodeMemorySection(module.memories));
  }

  if (module.globals) {
    output.push(...encodeGlobalSection(module.globals));
  }

  if (module.exports) {
    output.push(...encodeExportSection(module.exports));
  }

  if (module.start) {
    output.push(...encodeStartSection(module.start));
  }

  if (module.elements) {
    output.push(...encodeElementSection(module.elements));
  }

  if (module.code) {
    output.push(...encodeCodeSection(module.code));
  }

  if (module.data) {
    output.push(...encodeDataSection(module.data));
  }

  if (module.dataCount) {
    output.push(...encodeDataCountSection(module.dataCount));
  }

  return output;
}

function encodeSection<T extends { id: number }, U>(
  section: T,
  itemsFn: (s: T) => U[],
  encodeFn: (item: U) => number[]
): number[] {
  const output: number[] = [section.id];
  const items = itemsFn(section);
  // We push to this temporary array cause we need the size of the
  // section content
  const sectionContent = [];

  sectionContent.push(...toUnsignedLEB128(items.length));

  for (const item of items) {
    sectionContent.push(...encodeFn(item));
  }

  output.push(...toUnsignedLEB128(sectionContent.length));
  output.push(...sectionContent);

  return output;
}

export function encodeTypeSection(typeSection: TypeSection): number[] {
  return encodeSection(typeSection, (section) => section.types, encodeFuncType);
}

export function encodeImportSection(importSection: ImportSection): number[] {
  return encodeSection(
    importSection,
    (section) => section.imports,
    encodeImportEntry
  );
}

export function encodeFunctionSection(
  functionSection: FunctionSection
): number[] {
  return encodeSection(
    functionSection,
    (section) => section.functionTypes,
    toUnsignedLEB128
  );
}

export function encodeTableSection(tableSection: TableSection): number[] {
  return encodeSection(
    tableSection,
    (section) => section.tables,
    encodeTableType
  );
}

export function encodeMemorySection(memorySection: MemorySection): number[] {
  return encodeSection(
    memorySection,
    (section) => section.memories,
    encodeResizableLimits
  );
}

export function encodeGlobalSection(globalSection: GlobalSection): number[] {
  return encodeSection(
    globalSection,
    (section) => section.globals,
    encodeGlobal
  );
}

export function encodeExportSection(exportSection: ExportSection): number[] {
  return encodeSection(
    exportSection,
    (section) => section.exports,
    encodeExport
  );
}

export function encodeStartSection(startSection: StartSection): number[] {
  const startId = toUnsignedLEB128(startSection.startFunction);
  return [startSection.id, ...toUnsignedLEB128(startId.length), ...startId];
}

export function encodeElementSection(elementSection: ElementSection): number[] {
  return encodeSection(
    elementSection,
    (section) => section.elements,
    encodeElement
  );
}

export function encodeCodeSection(codeSection: CodeSection): number[] {
  return encodeSection(codeSection, (section) => section.code, encodeCode);
}

export function encodeDataSection(dataSection: DataSection): number[] {
  return encodeSection(dataSection, (section) => section.data, encodeData);
}

export function encodeDataCountSection(
  dataCountSection: DataCountSection
): number[] {
  return encodeSection(
    dataCountSection,
    (section) => [section.dataCount],
    toUnsignedLEB128
  );
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

function encodeImportEntry(importEntry: ImportEntry): number[] {
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
