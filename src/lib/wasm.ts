export const VERSION = 0x1;
export const MAGIC_NUMBER = 0x6d736100;

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

// Most sections follow this format
export interface Section<Id extends number, Item> {
  id: Id;
  items: Item[];
}

export interface CustomSection {
  id: 0;
  name: string;
  contents: Uint8Array;
}

export type TypeSection = Section<1, FuncType>;
export type ImportSection = Section<2, Import>;
export type FunctionSection = Section<3, number>;
export type TableSection = Section<4, TableType>;
export type MemorySection = Section<5, ResizableLimits>;
export type GlobalSection = Section<6, Global>;
export type ExportSection = Section<7, Export>;

export interface StartSection {
  id: 8;
  startFunction: number;
}

export type ElementSection = Section<9, Element>;
export type CodeSection = Section<10, Code>;
export type DataSection = Section<11, Data>;

// Btw does Data Count not sound like
// a evil vampire who steals precious
// data from the innocent? Just me?
export interface DataCountSection {
  id: 12;
  dataCount: number;
}

export enum ExternalKind {
  Function = 0,
  Table = 1,
  Memory = 2,
  Global = 3,
}

export interface Import {
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
  minimum: number;
  maximum?: number;
}

export interface GlobalType {
  type: ValueType;
  mutability: boolean;
}

export interface Global {
  type: GlobalType;
  initExpr: OpCode[];
}

export enum ElementKind {
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
      kind: ElementKind;
      functionIds: FuncId[];
    }
  | {
      id: 0x02; // Active
      tableIndex: number;
      offsetExpr: OpCode[];
      kind: ElementKind;
      functionIds: FuncId[];
    }
  | {
      id: 0x03; // Declarative
      kind: ElementKind;
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

export type LocalVariables = Map<ValueType, number>;

export interface Code {
  locals: LocalVariables;
  code: OpCode[];
}

export type Data =
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
      bytes: Uint8Array;
    };

export interface Export {
  name: string;
  kind: ExternalKind;
  index: number;
}

export type OpCode = number;

export interface Module {
  types: TypeSection;
  imports: ImportSection;
  functions: FunctionSection;
  tables: TableSection;
  memories: MemorySection;
  globals: GlobalSection;
  exports: ExportSection;
  start?: StartSection;
  elements: ElementSection;
  code: CodeSection;
  data: DataSection;
  dataCount?: DataCountSection;
  customSections: CustomSection[];
}
