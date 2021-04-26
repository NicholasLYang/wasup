import {
  ExternalKind,
  FunctionSection,
  FuncType,
  GlobalSection,
  ImportEntry,
  ImportSection,
  MemorySection,
  Module,
  OpCode,
  ResizableLimits,
  TableSection,
  TableType,
  TypeSection,
  Global,
  Export,
  ExportSection,
  StartSection,
} from './wasm';
import { getEncodedSize } from './leb128';
import Global = WebAssembly.Global;
import Global = WebAssembly.Global;

function getFuncTypeSize(funcType: FuncType): number {
  return (
    1 + // Type constructor
    // length of the vector as varuint32
    getEncodedSize(funcType.paramTypes.length) +
    // Actual types
    funcType.paramTypes.length +
    getEncodedSize(funcType.returnTypes.length) +
    funcType.returnTypes.length
  );
}

function getResizeableLimitsSize(limits: ResizableLimits) {
  let limitsLen = 1 + getEncodedSize(limits.initial);
  if (limits.maximum) {
    limitsLen += getEncodedSize(limits.maximum);
  }
  return limitsLen;
}

function getImportEntrySize(importEntry: ImportEntry) {
  const nameLen = new TextEncoder().encode(importEntry.module).length;
  const fieldLen = new TextEncoder().encode(importEntry.field).length;

  // 1 byte for the kind
  let descLen = 1;
  const { description } = importEntry;
  switch (description.kind) {
    case ExternalKind.Function:
      descLen += getEncodedSize(description.typeIndex);
      break;
    case ExternalKind.Table:
      // 1 for reftype
      descLen += 1 + getResizeableLimitsSize(description.tableType.limits);
      break;
    case ExternalKind.Memory:
      descLen += getResizeableLimitsSize(description.memoryType);
      break;
    case ExternalKind.Global:
      // 1 for ValueType and 1 for mutability
      descLen += 2;
      break;
  }

  return (
    getEncodedSize(nameLen) +
    nameLen +
    getEncodedSize(fieldLen) +
    fieldLen +
    descLen
  );
}

function getTableTypeSize(tableType: TableType): number {
  // 1 for ref type
  return 1 + getResizeableLimitsSize(tableType.limits);
}

function getGlobalSize(global: Global): number {
  // Global type is 2 bytes (bool + value type)
  return 2 + getInstrListSize(global.initExpr);
}

function getInstrListSize(instrList: OpCode[]) {
  return 1 + instrList.length;
}

function getExportSize(exportEntry: Export) {
  const nameLen = new TextEncoder().encode(exportEntry.name).length;

  return (
    getEncodedSize(nameLen) + nameLen + 1 + getEncodedSize(exportEntry.index)
  );
}

function getSectionSize<T>(entries: T[], sizeFn: (e: T) => number) {
  // Allocate space for length prefix
  let vecSize = getEncodedSize(entries.length);

  for (const entry of entries) {
    vecSize += sizeFn(entry);
  }

  return (
    1 + // Module ID
    getEncodedSize(vecSize) + // Payload length
    vecSize // Payload
  );
}

/**
 * Gets size of type section, including
 * the standard section preamble
 *
 * @param typeSection - Types section.
 * @returns Size of types section in bytes
 */
export function getTypeSectionSize(typeSection: TypeSection) {
  return getSectionSize(typeSection.types, getFuncTypeSize);
}

/**
 * Gets size of import section, including
 * the standard section preamble
 *
 * @param importSection - Import section.
 * @returns Size of import section in bytes
 */
export function getImportSectionSize(importSection: ImportSection) {
  return getSectionSize(importSection.imports, getImportEntrySize);
}

/**
 * Gets size of function section, including
 * the standard section preamble
 *
 * @param functionSection - function section.
 * @returns Size of function section in bytes
 */
export function getFunctionSectionSize(functionSection: FunctionSection) {
  return getSectionSize(functionSection.types, getEncodedSize);
}

/**
 * Gets size of table section, including
 * the standard section preamble
 *
 * @param tableSection - table section.
 * @returns Size of table section in bytes
 */
export function getTableSectionSize(tableSection: TableSection) {
  return getSectionSize(tableSection.tables, getTableTypeSize);
}

/**
 * Gets size of memory section, including
 * the standard section preamble
 *
 * @param memorySection - memory section.
 * @returns Size of memory section in bytes
 */
export function getMemorySectionSize(memorySection: MemorySection) {
  return getSectionSize(memorySection.memories, getResizeableLimitsSize);
}

/**
 * Gets size of global section, including
 * the standard section preamble
 *
 * @param globalSection - global section.
 * @returns Size of global section in bytes
 */
export function getGlobalSectionSize(globalSection: GlobalSection) {
  return getSectionSize(globalSection.globals, getGlobalSize);
}

/**
 * Gets size of export section, including
 * the standard section preamble
 *
 * @param exportSection - export section.
 * @returns Size of export section in bytes
 */
export function getExportSectionSize(exportSection: ExportSection) {
  return getSectionSize(exportSection.exports, getExportSize);
}

/**
 * Gets size of start section, including
 * the standard section preamble
 *
 * @param startSection - start section.
 * @returns Size of start section in bytes
 */
export function getStartSectionSize(startSection: StartSection) {
  return getSectionSize([startSection.startFunction], getEncodedSize);
}

export function getModuleSize(module: Module): number {
  return (
    getTypeSectionSize(module.types) +
    getImportSectionSize(module.imports) +
    getFunctionSectionSize(module.functions) +
    getTableSectionSize(module.tables) +
    getMemorySectionSize(module.memories) +
    getGlobalSectionSize(module.globals) +
    getExportSectionSize(module.exports) +
    getStartSectionSize(module.start)
  );
}
