import {
  ExternalKind,
  FuncType,
  GlobalType,
  ImportEntry,
  ImportSection,
  Module,
  ResizableLimits,
  TableType,
  TypeSection,
  ValueType,
} from './wasm';
import { getImportSectionSize, getTypeSectionSize } from './size';
import { toUnsignedLEB128 } from './leb128';

export function encodeModule(module: Module) {
  if (module.types) {
    console.log(encodeTypeSection(module.types));
  }
}

function encodeSection<T extends { id: number }, U>(
  section: T,
  sizeFn: (s: T) => number,
  itemsFn: (s: T) => U[],
  encodeFn: (item: U) => number[]
): number[] {
  const size = sizeFn(section);
  const output: number[] = [section.id];
  const items = itemsFn(section);

  output.push(...toUnsignedLEB128(size));
  output.push(...toUnsignedLEB128(items.length));

  for (const item of items) {
    output.push(...encodeFn(item));
  }

  return output;
}

export function encodeTypeSection(typeSection: TypeSection): number[] {
  return encodeSection(
    typeSection,
    getTypeSectionSize,
    (section) => section.types,
    encodeFuncType
  );
}

export function encodeImportSection(importSection: ImportSection): number[] {
  return encodeSection(
    importSection,
    getImportSectionSize,
    (section) => section.imports,
    encodeImportEntry
  );
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
