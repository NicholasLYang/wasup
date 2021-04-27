type FuncId = number;

export enum NumType {
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
}

export enum RefType {
  funcRef = 0x70,
  externRef = 0x6f,
}

export type ValueType = RefType | NumType;

export interface FuncType {
  paramTypes: ValueType[];
  returnTypes: ValueType[];
}

export interface TypeSection {
  id: 1;
  types: FuncType[];
}

export interface ImportSection {
  id: 2;
  imports: ImportEntry[];
}

export interface FunctionSection {
  id: 3;
  // indices into types section
  types: number[];
}

export interface TableSection {
  id: 4;
  tables: TableType[];
}

export interface MemorySection {
  id: 5;
  memories: ResizableLimits[];
}

export interface GlobalSection {
  id: 6;
  globals: Global[];
}

export interface ExportSection {
  id: 7;
  exports: Export[];
}

export interface StartSection {
  id: 8;
  startFunction: number;
}

export interface ElementSection {
  id: 9;
  elements: Element;
}

export interface CodeSection {
  id: 10;
  code: FunctionBody[];
}

export interface DataSection {
  id: 11;
  data: Data[];
}

export enum ExternalKind {
  Function = 0,
  Table = 1,
  Memory = 2,
  Global = 3,
}

export interface ImportEntry {
  module: string;
  field: string;
  description:
    | {
        kind: ExternalKind.Function;
        typeIndex: number;
      }
    | {
        kind: ExternalKind.Table;
        tableType: TableType;
      }
    | {
        kind: ExternalKind.Memory;
        memoryType: ResizableLimits;
      }
    | {
        kind: ExternalKind.Global;
        globalType: GlobalType;
      };
}

export interface TableType {
  elementType: RefType;
  limits: ResizableLimits;
}

export interface ResizableLimits {
  initial: number;
  maximum?: number;
}

interface GlobalType {
  type: ValueType;
  mutability: boolean;
}

export interface Global {
  type: GlobalType;
  initExpr: OpCode[];
}

enum ElementKind {
  FuncRef = 0x00,
}

export type Element =
  | {
      id: 0x00; // Active mode
      offsetExpr: OpCode[];
      functionIds: FuncId[];
    }
  | {
      id: 0x01; // Passive
      elementKind: ElementKind;
      functionIds: FuncId[];
    }
  | {
      id: 0x02; // Active
      tableIndex: number;
      offsetExpr: OpCode[];
      elementKind: ElementKind;
      functionIds: FuncId[];
    }
  | {
      id: 0x03; // Declarative
      elementKind: ElementKind;
      functionIds: FuncId[];
    }
  | {
      id: 0x04; // Active
      offsetExpr: OpCode[];
      initExprs: OpCode[][];
    }
  | {
      id: 0x05; // Passive
      refType: RefType;
      initExprs: OpCode[][];
    }
  | {
      id: 0x06; // Active
      tableIndex: number;
      offsetExpr: OpCode[];
      refType: RefType;
      initExprs: OpCode[][];
    }
  | {
      id: 0x07; // Declarative
      refType: RefType;
      initExprs: OpCode[][];
    };

export interface FunctionBody {
  locals: { [valueType in ValueType]: number };
  code: OpCode[];
}

type Data =
  | {
      id: 0x00;
      offsetExpr: OpCode[];
      bytes: Uint8Array;
    }
  | {
      id: 0x01;
      bytes: Uint8Array;
    }
  | {
      id: 0x02;
      memoryIndex: number;
      offsetExpr: OpCode[];
      bytes: [];
    };

export interface Export {
  name: string;
  kind: ExternalKind;
  index: number;
}

// Can be extended for any custom section
interface CustomSection {
  id: 0;
  name: string;
}

export enum OpCode {}

export interface Module {
  types: TypeSection;
  functions: FunctionSection;
  tables: TableSection;
  memories: MemorySection;
  globals: GlobalSection;
  elements: ElementSection;
  data: DataSection;
  start: StartSection;
  imports: ImportSection;
  exports: ExportSection;
  code: CodeSection;
  customSections: CustomSection[];
}

export const VERSION = 0x1;
export const MAGIC_NUMBER = 0x6d736100;
