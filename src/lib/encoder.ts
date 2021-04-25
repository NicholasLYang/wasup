import { FuncType, Module, TypeSection } from './wasm';
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
 * @param types - Types section.
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

export function getModuleSize(module: Module): number {
  return getTypeSectionSize(module.types);
}
