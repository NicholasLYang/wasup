import {
  Expr,
  ExternalKind,
  FuncType,
  LocalVariables,
  Module,
  ValueType,
} from './wasm';

class BuilderError extends Error {
  constructor(message: string) {
    super(message);
  }
}

// A function starts out Active until it's added to a module
// at which point it becomes NotActive. This is to prevent
// users from adding a function to a module, then editing the
// function further and wondering why the changes aren't in the module
enum FuncMode {
  Active,
  NotActive,
}

interface Func {
  mode: FuncMode;
  name?: string;
  locals: LocalVariables;
  localCount: number;
  type: FuncType;
  code: Expr;
}

interface Local {
  index: number;
}

export function createFunction(type: FuncType, code: Expr) {
  return {
    mode: FuncMode.Active,
    locals: [],
    localsCount: 0,
    type,
    code,
  };
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
 * Takes in a module and adds a function to it.
 *
 * Note: Once a function is added to a module, you cannot reuse it.
 * This is to prevent users from adding it to a module then editing
 * the function further and wondering why the changes are not showing up.
 *
 * If a name is provided, we generate an export with that name
 *
 * @param module - A WebAssembly Module
 * @param func - The function
 * @returns Module with new function.
 */
export function addFunction(module: Module, func: Func): Module {
  module.types.items.push(func.type);
  module.functions.items.push(module.types.items.length - 1);
  module.code.items.push({ locals: func.locals, code: [...func.code] });

  if (func.name) {
    // This works if we don't reuse type signatures. If we do, then this
    // breaks.
    const funcIndex = module.types.items.length - 1;

    module.exports.items.push({
      name: func.name,
      index: funcIndex,
      kind: ExternalKind.Function,
    });
  }

  func.mode = FuncMode.NotActive;

  return module;
}

export function addLocal(func: Func, type: ValueType): Local {
  if (func.mode === FuncMode.NotActive) {
    throw new BuilderError(
      'Cannot add local to function that is no longer active'
    );
  }

  func.locals.push({ count: 1, type });

  return { index: func.locals.length - 1 };
}
