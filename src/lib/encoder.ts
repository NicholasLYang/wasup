import {
  ExternalKind,
  FuncType,
  ImportEntry,
  ImportSection,
  Module,
  ResizableLimits,
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

/**
 * Gets size of types section, including
 * the standard section preamble
 *
 * @param typeSection - Types section.
 * @returns Size of types section in bytes
 */
export function getTypeSectionSize(typeSection: TypeSection) {
  // Allocate space for length prefix
  let typeVecSize = getEncodedSize(typeSection.types.length);

  for (const funcType of typeSection.types) {
    typeVecSize += getFuncTypeSize(funcType);
  }

  return (
    1 + // Module ID
    getEncodedSize(typeVecSize) + // Payload length
    typeVecSize // Payload
  );
}

function getResizeableLimitsSize(limits: ResizableLimits) {
  let limitsLen = 1 + getEncodedSize(limits.initial);
  if (limits.maximum) {
    limitsLen += getEncodedSize(limits.maximum);
  }
  return limitsLen;
}

export function getImportEntrySize(importEntry: ImportEntry) {
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

export function getImportSectionSize(importSection: ImportSection) {}

export function getModuleSize(module: Module): number {
  return getTypeSectionSize(module.types);
}
