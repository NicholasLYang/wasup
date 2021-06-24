import {
  BlockType,
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
  Expr,
  ExternalKind,
  FunctionSection,
  FuncType,
  Global,
  GlobalSection,
  Import,
  ImportSection,
  InstrType,
  Instruction,
  MemorySection,
  Module,
  OtherInstrType,
  RefType,
  ResizableLimits,
  StartSection,
  TableSection,
  TableType,
  TypeSection,
} from './wasm';
import { getLEB128SSize, getLEB128USize } from './leb128';

export function getFuncTypeSize(funcType: FuncType): number {
  return (
    1 + // Type constructor
    // length of the vector as varuint32
    getLEB128USize(funcType.paramTypes.length) +
    // Actual types
    funcType.paramTypes.length +
    getLEB128USize(funcType.returnTypes.length) +
    funcType.returnTypes.length
  );
}

function getResizeableLimitsSize(limits: ResizableLimits) {
  let limitsLen = 1 + getLEB128USize(limits.minimum);
  if (limits.maximum) {
    limitsLen += getLEB128USize(limits.maximum);
  }
  return limitsLen;
}

export function getImportEntrySize(importEntry: Import) {
  const nameLen = new TextEncoder().encode(importEntry.module).length;
  const fieldLen = new TextEncoder().encode(importEntry.field).length;

  // 1 byte for the kind
  let descLen = 1;
  const { description } = importEntry;
  switch (description.kind) {
    case ExternalKind.Function:
      descLen += getLEB128USize(description.typeIndex);
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
    getLEB128USize(nameLen) +
    nameLen +
    getLEB128USize(fieldLen) +
    fieldLen +
    descLen
  );
}

export function getTableTypeSize(tableType: TableType): number {
  // 1 for ref type
  return 1 + getResizeableLimitsSize(tableType.limits);
}

function getGlobalSize(global: Global): number {
  // Global type is 2 bytes (bool + value type)
  return 2 + global.initExpr.length;
}

function getExportSize(exportEntry: Export) {
  const nameLen = new TextEncoder().encode(exportEntry.name).length;

  return (
    getLEB128USize(nameLen) + nameLen + 1 + getLEB128USize(exportEntry.index)
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
    offsetExpr?: Uint8Array;
    functionIds?: number[];
    refType?: RefType;
    elementKind?: ElementKind;
    initExprs?: Uint8Array[];
  };

  if (tableIndex) {
    elementSize += getLEB128USize(tableIndex);
  }

  if (offsetExpr) {
    elementSize += offsetExpr.length;
  }

  if (functionIds) {
    elementSize += getVecSize(functionIds, getLEB128USize);
  }

  if (refType) {
    elementSize += 1;
  }

  if (elementKind) {
    elementSize += 1;
  }

  if (initExprs) {
    for (const expr of initExprs) {
      elementSize += expr.length;
    }
  }

  return elementSize;
}

function getBlockTypeSize(blockType: BlockType) {
  if ('valueType' in blockType) {
    return 1;
  }

  if ('typeIndex' in blockType) {
    return getLEB128SSize(blockType.typeIndex);
  }

  throw new Error('INTERNAL: Block type must be either valueType or typeIndex');
}

export function getInstructionSize(instr: Instruction) {
  switch (instr[0]) {
    case InstrType.Block:
    case InstrType.Loop: {
      return 1 + getBlockTypeSize(instr[1]) + getExprSize(instr[2]);
    }
    case InstrType.If: {
      if (instr.length == 3) {
        return 1 + getBlockTypeSize(instr[1]) + getExprSize(instr[2]);
      } else {
        return (
          1 +
          getBlockTypeSize(instr[1]) +
          getExprSize(instr[2]) +
          getExprSize(instr[3])
        );
      }
    }
    case InstrType.Call:
    case InstrType.Br:
    case InstrType.BrIf:
    case InstrType.RefFunc:
    case InstrType.LocalGet:
    case InstrType.LocalSet:
    case InstrType.LocalTee:
    case InstrType.GlobalGet:
    case InstrType.GlobalSet:
    case InstrType.TableGet:
    case InstrType.TableSet: {
      return 1 + getLEB128USize(instr[1]);
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
      return 1 + getLEB128USize(instr[1]) + getLEB128USize(instr[2]);
    }
    case InstrType.Other: {
      const instrSize = 1 + getLEB128USize(instr[1]);
      switch (instr[1]) {
        case OtherInstrType.TableInit:
        case OtherInstrType.TableCopy: {
          return (
            instrSize + getLEB128USize(instr[2]) + getLEB128USize(instr[3])
          );
        }
        case OtherInstrType.ElemDrop:
        case OtherInstrType.TableGrow:
        case OtherInstrType.TableSize:
        case OtherInstrType.TableFill:
        case OtherInstrType.DataDrop: {
          return instrSize + getLEB128USize(instr[2]);
        }
        case OtherInstrType.MemoryInit: {
          return instrSize + getLEB128USize(instr[2]) + 1;
        }
        case OtherInstrType.MemoryCopy: {
          return instrSize + 2;
        }
        case OtherInstrType.MemoryFill: {
          return instrSize + 1;
        }
        case OtherInstrType.I32TruncSatF32S:
        case OtherInstrType.I32TruncSatF32U:
        case OtherInstrType.I32TruncSatF64S:
        case OtherInstrType.I32TruncSatF64U:
        case OtherInstrType.I64TruncSatF32S:
        case OtherInstrType.I64TruncSatF32U:
        case OtherInstrType.I64TruncSatF64S:
        case OtherInstrType.I64TruncSatF64U: {
          return instrSize;
        }
        default: {
          throw new Error(`Unexpected instruction: ${instr[1].toString(16)}`);
        }
      }
    }
    case InstrType.BrTable: {
      return (
        1 + getVecSize(instr[1], getLEB128USize) + getLEB128USize(instr[2])
      );
    }
    case InstrType.RefNull: {
      return 2;
    }
    case InstrType.SelectT: {
      return 1 + instr[1].length;
    }
    case InstrType.MemorySize:
    case InstrType.MemoryGrow: {
      return 2;
    }
    case InstrType.I32Const:
    case InstrType.I64Const: {
      return 1 + getLEB128SSize(instr[1]);
    }
    case InstrType.F32Const: {
      return 5;
    }
    case InstrType.F64Const: {
      return 9;
    }
    default: {
      if (instr.length === 1) {
        return 1;
      } else {
        throw new Error('Invalid instruction');
      }
    }
  }

  throw new Error(`INTERNAL: Should be exhaustive match`);
}

function getExprSize(expr: Expr) {
  // We start with 1 for end byte
  let totalSize = 1;

  for (const instr of expr) {
    totalSize += getInstructionSize(instr);
  }

  return totalSize;
}

// Get the function body size WITHOUT the size prefix.
// Code bodies in WASM have a size prefix that gives the
// size of the body in bytes. For figuring out the total
// size of the module, we have to include this. For figuring
// out the size itself to encode, we don't want to include it
export function getCodeSize(body: Code): number {
  const localsSize = getVecSize([...body.locals.entries()], ([_, count]) => {
    return 1 + getLEB128USize(count);
  });
  return getExprSize(body.code) + localsSize;
}

function getDataSize(data: Data) {
  switch (data.id) {
    case 0x00:
      return (
        1 +
        data.offsetExpr.length +
        getLEB128USize(data.bytes.length) +
        data.bytes.length
      );
    case 0x01:
      return 1 + getLEB128USize(data.bytes.length) + data.bytes.length;
    case 0x02:
      return (
        1 +
        data.memoryIndex +
        data.offsetExpr.length +
        getLEB128USize(data.bytes.length) +
        data.bytes.length
      );
  }
}

export function getVecSize<T>(entries: T[], sizeFn: (e: T) => number) {
  // Allocate space for length prefix
  let vecSize = getLEB128USize(entries.length);

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
  return getVecSize(typeSection.items, getFuncTypeSize);
}

/**
 * Gets size of import section, excluding
 * the standard section preamble
 *
 * @param importSection - Import section.
 * @returns Size of import section in bytes
 */
export function getImportSectionSize(importSection: ImportSection) {
  return getVecSize(importSection.items, getImportEntrySize);
}

/**
 * Gets size of function section, excluding
 * the standard section preamble
 *
 * @param functionSection - function section.
 * @returns Size of function section in bytes
 */
export function getFunctionSectionSize(functionSection: FunctionSection) {
  return getVecSize(functionSection.items, getLEB128USize);
}

/**
 * Gets size of table section, excluding
 * the standard section preamble
 *
 * @param tableSection - table section.
 * @returns Size of table section in bytes
 */
export function getTableSectionSize(tableSection: TableSection) {
  return getVecSize(tableSection.items, getTableTypeSize);
}

/**
 * Gets size of memory section, excluding
 * the standard section preamble
 *
 * @param memorySection - memory section.
 * @returns Size of memory section in bytes
 */
export function getMemorySectionSize(memorySection: MemorySection) {
  return getVecSize(memorySection.items, getResizeableLimitsSize);
}

/**
 * Gets size of global section, excluding
 * the standard section preamble
 *
 * @param globalSection - global section.
 * @returns Size of global section in bytes
 */
export function getGlobalSectionSize(globalSection: GlobalSection) {
  return getVecSize(globalSection.items, getGlobalSize);
}

/**
 * Gets size of export section, excluding
 * the standard section preamble
 *
 * @param exportSection - export section.
 * @returns Size of export section in bytes
 */
export function getExportSectionSize(exportSection: ExportSection) {
  return getVecSize(exportSection.items, getExportSize);
}

/**
 * Gets size of start section, excluding
 * the standard section preamble
 *
 * @param startSection - start section.
 * @returns Size of start section in bytes
 */
export function getStartSectionSize(startSection: StartSection) {
  return getLEB128USize(startSection.startFunction);
}

/**
 * Gets size of element section, excluding
 * the standard section preamble
 *
 * @param elementSection - element section.
 * @returns Size of element section in bytes
 */
export function getElementSectionSize(elementSection: ElementSection) {
  return getVecSize(elementSection.items, getElementSize);
}

/**
 * Gets size of code section, excluding
 * the standard section preamble
 *
 * @param codeSection - code section.
 * @returns Size of code section in bytes
 */
export function getCodeSectionSize(codeSection: CodeSection) {
  return getVecSize(codeSection.items, (item) => {
    const bodySize = getCodeSize(item);
    return getLEB128USize(bodySize) + bodySize;
  });
}

/**
 * Gets size of data section, excluding
 * the standard section preamble
 *
 * @param dataSection - data section.
 * @returns Size of data section in bytes
 */
export function getDataSectionSize(dataSection: DataSection) {
  return getVecSize(dataSection.items, getDataSize);
}

/**
 * Gets size of data count section, excluding
 * the standard section preamble
 *
 * @param dataCountSection - data count section.
 * @returns Size of data count section in bytes
 */
export function getDataCountSection(dataCountSection: DataCountSection) {
  const dataCountSize = getLEB128USize(dataCountSection.dataCount);
  return 1 + getLEB128USize(dataCountSize) + dataCountSize;
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
      getLEB128USize(nameLen) + nameLen + section.contents.length;
    totalSize += getLEB128USize(sectionLen) + sectionLen;
  }

  return totalSize;
}

export interface SizeInfo {
  total: number;
  sections: { [Property in keyof Module]?: number };
}

export function getModuleSize(module: Module): SizeInfo {
  const sections: Partial<SizeInfo['sections']> = {};
  let totalSize = 8; // Magic number + version

  if (module.types.items.length > 0) {
    sections.types = getTypeSectionSize(module.types);
    totalSize += 1 + getLEB128USize(sections.types) + sections.types;
  }

  if (module.imports.items.length > 0) {
    sections.imports = getImportSectionSize(module.imports);
    totalSize += 1 + getLEB128USize(sections.imports) + sections.imports;
  }

  if (module.functions.items.length > 0) {
    sections.functions = getFunctionSectionSize(module.functions);
    totalSize += 1 + getLEB128USize(sections.functions) + sections.functions;
  }

  if (module.tables.items.length > 0) {
    sections.tables = getTableSectionSize(module.tables);
    totalSize += 1 + getLEB128USize(sections.tables) + sections.tables;
  }

  if (module.memories.items.length > 0) {
    sections.memories = getMemorySectionSize(module.memories);
    totalSize += 1 + getLEB128USize(sections.memories) + sections.memories;
  }

  if (module.globals.items.length > 0) {
    sections.globals = getGlobalSectionSize(module.globals);
    totalSize += 1 + getLEB128USize(sections.globals) + sections.globals;
  }

  if (module.exports.items.length > 0) {
    sections.exports = getExportSectionSize(module.exports);
    totalSize += 1 + getLEB128USize(sections.exports) + sections.exports;
  }

  if (module.start) {
    sections.start = getStartSectionSize(module.start);
    totalSize += 1 + getLEB128USize(sections.start) + sections.start;
  }

  if (module.elements.items.length > 0) {
    sections.elements = getElementSectionSize(module.elements);
    totalSize += 1 + getLEB128USize(sections.elements) + sections.elements;
  }

  if (module.code.items.length > 0) {
    sections.code = getCodeSectionSize(module.code);
    totalSize += 1 + getLEB128USize(sections.code) + sections.code;
  }

  if (module.data.items.length > 0) {
    sections.data = getDataSectionSize(module.data);
    totalSize += 1 + getLEB128USize(sections.data) + sections.data;
  }

  if (module.dataCount) {
    sections.dataCount = getDataCountSection(module.dataCount);
    totalSize += 1 + getLEB128USize(sections.dataCount) + sections.dataCount;
  }

  if (module.customSections.length > 0) {
    sections.customSections = getCustomSectionsSize(module.customSections);
    totalSize += sections.customSections;
  }

  return { total: totalSize, sections };
}
