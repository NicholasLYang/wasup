import { ExternalKind, FuncType, LocalVariables, Module, OpCode } from './wasm';

interface Func {
  name?: string;
  locals?: LocalVariables;
  type: FuncType;
  code: OpCode[];
}

/**
 * Creates new, empty module
 *
 * @returns Empty, initialized module.
 */
export function createModule(): Module {
  return {
    types: { id: 1, items: [] },
    imports: { id: 2, items: [] },
    functions: { id: 3, items: [] },
    tables: { id: 4, items: [] },
    memories: { id: 5, items: [] },
    globals: { id: 6, items: [] },
    exports: { id: 7, items: [] },
    elements: { id: 9, items: [] },
    code: { id: 10, items: [] },
    data: { id: 11, items: [] },
    customSections: [],
  };
}

/**
 * Takes in a module and adds a function to it. Note: This mutates
 * the module.
 *
 * If a name is provided, we generate an export with that name
 *
 * @param module - A WebAssembly Module
 * @param func - The function
 * @returns Module with new function.
 */
export function addFunction(module: Module, func: Func): Module {
  module.types = module.types ?? { id: 1, items: [] };
  module.functions = module.functions ?? { id: 3, items: [] };
  module.code = module.code ?? { id: 10, items: [] };

  module.types.items.push(func.type);
  module.functions.items.push(module.types.items.length - 1);
  module.code.items.push({ locals: func.locals ?? new Map(), code: func.code });

  if (func.name) {
    module.exports = module.exports ?? { id: 7, exports: [] };

    // This works if we don't reuse type signatures. If we do, then this
    // breaks.
    const funcIndex = module.types.items.length - 1;

    module.exports.items.push({
      name: func.name,
      index: funcIndex,
      kind: ExternalKind.Function,
    });
  }

  return module;
}
