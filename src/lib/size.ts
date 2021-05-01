import {
  Code,
  CodeSection,
  CustomSection,
  Data,
  DataCountSection,
  DataSection,
  Element,
  ElementKind,
  ElementSection,
  Export,
  ExportSection,
  ExternalKind,
  FunctionSection,
  FuncType,
  Global,
  GlobalSection,
  ImportEntry,
  ImportSection,
  MemorySection,
  Module,
  OpCode,
  RefType,
  ResizableLimits,
  StartSection,
  TableSection,
  TableType,
  TypeSection,
} from './wasm';
import { getEncodedSize } from './leb128';

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
  let limitsLen = 1 + getEncodedSize(limits.minimum);
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

function getElementSize(element: Element) {
  let elementSize = 1;
  // We need to do this because TypeScript isn't smart enough
  // to recognize that Element is an enum that may or may not contain
  // these fields
  const {
    tableIndex,
    offsetExpr,
    functionIds,
    refType,
    elementKind,
    initExprs,
  } = element as {
    tableIndex?: number;
    offsetExpr?: OpCode[];
    functionIds?: number[];
    refType?: RefType;
    elementKind?: ElementKind;
    initExprs?: OpCode[][];
  };

  if (tableIndex) {
    elementSize += getEncodedSize(tableIndex);
  }

  if (offsetExpr) {
    elementSize += getInstrListSize(offsetExpr);
  }

  if (functionIds) {
    elementSize += getVecSize(functionIds, getEncodedSize);
  }

  if (refType) {
    elementSize += 1;
  }

  if (elementKind) {
    elementSize += 1;
  }

  if (initExprs) {
    for (const expr of initExprs) {
      elementSize += getInstrListSize(expr);
    }
  }

  return elementSize;
}

function getFunctionBodySize(body: Code): number {
  const localsSize = getVecSize(Object.entries(body.locals), ([_, count]) => {
    return 1 + getEncodedSize(count);
  });

  const bodySize = getInstrListSize(body.code) + localsSize;
  return getEncodedSize(bodySize) + bodySize;
}

function getDataSize(data: Data) {
  switch (data.id) {
    case 0x00:
      return (
        1 +
        getInstrListSize(data.offsetExpr) +
        getEncodedSize(data.bytes.length) +
        data.bytes.length
      );
    case 0x01:
      return 1 + getEncodedSize(data.bytes.length) + data.bytes.length;
    case 0x02:
      return (
        1 +
        data.memoryIndex +
        getInstrListSize(data.offsetExpr) +
        getEncodedSize(data.bytes.length) +
        data.bytes.length
      );
  }
}

function getVecSize<T>(entries: T[], sizeFn: (e: T) => number) {
  // Allocate space for length prefix
  let vecSize = getEncodedSize(entries.length);

  for (const entry of entries) {
    vecSize += sizeFn(entry);
  }

  return vecSize;
}

/**
 * Gets size of type section, excluding
 * the standard section preamble
 *
 * @param typeSection - Types section.
 * @returns Size of types section in bytes
 */
export function getTypeSectionSize(typeSection: TypeSection) {
  return getVecSize(typeSection.types, getFuncTypeSize);
}

/**
 * Gets size of import section, excluding
 * the standard section preamble
 *
 * @param importSection - Import section.
 * @returns Size of import section in bytes
 */
export function getImportSectionSize(importSection: ImportSection) {
  return getVecSize(importSection.imports, getImportEntrySize);
}

/**
 * Gets size of function section, excluding
 * the standard section preamble
 *
 * @param functionSection - function section.
 * @returns Size of function section in bytes
 */
export function getFunctionSectionSize(functionSection: FunctionSection) {
  return getVecSize(functionSection.functionTypes, getEncodedSize);
}

/**
 * Gets size of table section, excluding
 * the standard section preamble
 *
 * @param tableSection - table section.
 * @returns Size of table section in bytes
 */
export function getTableSectionSize(tableSection: TableSection) {
  return getVecSize(tableSection.tables, getTableTypeSize);
}

/**
 * Gets size of memory section, excluding
 * the standard section preamble
 *
 * @param memorySection - memory section.
 * @returns Size of memory section in bytes
 */
export function getMemorySectionSize(memorySection: MemorySection) {
  return getVecSize(memorySection.memories, getResizeableLimitsSize);
}

/**
 * Gets size of global section, excluding
 * the standard section preamble
 *
 * @param globalSection - global section.
 * @returns Size of global section in bytes
 */
export function getGlobalSectionSize(globalSection: GlobalSection) {
  return getVecSize(globalSection.globals, getGlobalSize);
}

/**
 * Gets size of export section, excluding
 * the standard section preamble
 *
 * @param exportSection - export section.
 * @returns Size of export section in bytes
 */
export function getExportSectionSize(exportSection: ExportSection) {
  return getVecSize(exportSection.exports, getExportSize);
}

/**
 * Gets size of start section, excluding
 * the standard section preamble
 *
 * @param startSection - start section.
 * @returns Size of start section in bytes
 */
export function getStartSectionSize(startSection: StartSection) {
  return getVecSize([startSection.startFunction], getEncodedSize);
}

/**
 * Gets size of element section, excluding
 * the standard section preamble
 *
 * @param elementSection - element section.
 * @returns Size of element section in bytes
 */
export function getElementSectionSize(elementSection: ElementSection) {
  return getVecSize(elementSection.elements, getElementSize);
}

/**
 * Gets size of code section, excluding
 * the standard section preamble
 *
 * @param codeSection - code section.
 * @returns Size of code section in bytes
 */
export function getCodeSectionSize(codeSection: CodeSection) {
  return getVecSize(codeSection.code, getFunctionBodySize);
}

/**
 * Gets size of data section, excluding
 * the standard section preamble
 *
 * @param dataSection - data section.
 * @returns Size of data section in bytes
 */
export function getDataSectionSize(dataSection: DataSection) {
  return getVecSize(dataSection.data, getDataSize);
}

/**
 * Gets size of data count section, excluding
 * the standard section preamble
 *
 * @param dataCountSection - data count section.
 * @returns Size of data count section in bytes
 */
export function getDataCountSection(dataCountSection: DataCountSection) {
  const dataCountSize = getEncodedSize(dataCountSection.dataCount);
  return 1 + getEncodedSize(dataCountSize) + dataCountSize;
}

/**
 * Gets size of custom sections, excluding
 * the standard section preamble
 *
 * @param customSections - array of custom sections.
 * @returns Size of custom section in bytes
 */
export function getCustomSectionsSize(customSections: CustomSection[]) {
  let totalSize = 0;

  for (const section of customSections) {
    totalSize += 1; // Section ID
    const nameLen = new TextEncoder().encode(section.name).length;
    const sectionLen =
      getEncodedSize(nameLen) + nameLen + section.contents.length;
    totalSize += getEncodedSize(sectionLen) + sectionLen;
  }

  return totalSize;
}

interface SizeInfo {
  total: number;
  sections: { [Property in keyof Module]?: number };
}

export function getModuleSize(module: Module): SizeInfo {
  const sections: Partial<SizeInfo['sections']> = {};
  let totalSize = 8; // Magic number + version

  if (module.types) {
    sections.types = getTypeSectionSize(module.types);
    totalSize += sections.types;
  }

  if (module.imports) {
    sections.imports = getImportSectionSize(module.imports);
    totalSize += sections.imports;
  }

  if (module.functions) {
    sections.functions = getFunctionSectionSize(module.functions);
    totalSize += sections.functions;
  }

  if (module.tables) {
    sections.tables = getTableSectionSize(module.tables);
    totalSize += sections.tables;
  }

  if (module.memories) {
    sections.memories = getMemorySectionSize(module.memories);
    totalSize += sections.memories;
  }

  if (module.globals) {
    sections.globals = getGlobalSectionSize(module.globals);
    totalSize += sections.globals;
  }

  if (module.exports) {
    sections.exports = getExportSectionSize(module.exports);
    totalSize += sections.exports;
  }

  if (module.start) {
    sections.start = getStartSectionSize(module.start);
    totalSize += sections.start;
  }

  if (module.elements) {
    sections.elements = getElementSectionSize(module.elements);
    totalSize += sections.elements;
  }

  if (module.code) {
    sections.code = getCodeSectionSize(module.code);
    totalSize += sections.code;
  }

  if (module.data) {
    sections.data = getDataSectionSize(module.data);
    totalSize += sections.data;
  }

  if (module.dataCount) {
    sections.dataCount = getDataCountSection(module.dataCount);
    totalSize += sections.dataCount;
  }

  if (module.customSections.length > 0) {
    sections.customSections = getCustomSectionsSize(module.customSections);
    totalSize += sections.customSections;
  }

  return { total: totalSize, sections };
}
