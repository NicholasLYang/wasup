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

export enum Instruction {
  Unreachable = 0x00,
  Nop = 0x01,
  Block = 0x02,
  Loop = 0x03,
  If = 0x04,
  Else = 0x05,
  Br = 0x0c,
  BrIf = 0x0d,
  BrTable = 0x0e,
  Return = 0x0f,
  Call = 0x10,
  CallIndirect = 0x11,
  RefNull = 0xd0,
  RefIsNull = 0xd1,
  RefFunc = 0xd2,
  Drop = 0x1a,
  Select = 0x1b,
  SelectT = 0x1c,
  LocalGet = 0x20,
  LocalSet = 0x21,
  LocalTee = 0x22,
  GlobalGet = 0x23,
  GlobalSet = 0x24,
  I32Load = 0x28,
  I64Load = 0x29,
  F32Load = 0x2a,
  F64Load = 0x2b,
  I32Load8S = 0x2c,
  I32Load8U = 0x2d,
  I32Load16S = 0x2e,
  I32Load16U = 0x2f,
  I64Load8S = 0x30,
  I64Load8U = 0x31,
  I64Load16S = 0x32,
  I64Load16U = 0x33,
  I64Load32S = 0x34,
  I64Load32U = 0x35,
  I32Store = 0x36,
  I64Store = 0x37,
  F32Store = 0x38,
  F64Store = 0x39,
  I32Store8 = 0x3a,
  I32Store16 = 0x3b,
  I64Store8 = 0x3c,
  I64Store16 = 0x3d,
  I64Store32 = 0x3e,
  MemorySize = 0x3f,
  MemoryGrow = 0x40,
  I32Const = 0x41,
  I64Const = 0x42,
  F32Const = 0x43,
  F64Const = 0x44,
  I32EqZ = 0x45,
  I32Eq = 0x46,
  I32Ne = 0x47,
  I32LtS = 0x47,
  I32LtU = 0x48,
  I32GtS = 0x49,
  I32GtU = 0x4a,
  I32LeS = 0x4b,
  I32LeU = 0x4c,
  I32GeS = 0x4d,
  I32GeU = 0x4f,
  I64EqZ = 0x50,
  I64Eq = 0x51,
  I64Ne = 0x52,
  I64LtS = 0x53,
  I64LtU = 0x54,
  I64GtS = 0x55,
  I64GtU = 0x56,
  I64LeS = 0x57,
  I64LeU = 0x58,
  I64GeS = 0x59,
  I64GeU = 0x5a,
  F32Eq = 0x5b,
  F32Ne = 0x5c,
  F32Lt = 0x5d,
  F32Gt = 0x5e,
  F32Le = 0x5f,
  F32Ge = 0x60,
  F64Eq = 0x61,
  F64Ne = 0x62,
  F64Lt = 0x63,
  F64Gt = 0x64,
  F64Le = 0x65,
  F64Ge = 0x66,
  I32Clz = 0x67,
  I32Ctz = 0x68,
  I32Popcnt = 0x69,
  I32Add,
  I32Sub,
  I32Mul,
  I32DivS,
  I32DivU,
  I32RemS,
  I32RemU,
  I32And,
  I32Or,
  I32Xor,
  I32Shl,
  I32ShrS,
  I32ShrU,
  I32Rotl,
  I32Rotr,
  I64Clz,
  I64Ctz,
  I64Popcnt,
  I64Add,
  I64Sub,
  I64Mul,
  I64DivS,
  I64DivU,
  I64RemS,
  I64RemU,
  I64And,
  I64Or,
  I64Xor,
  I64Shl,
  I64ShrS,
  I64ShrU,
  I64Rotl,
  I64Rotr,
  F32Abs,
  F32Neg,
  F32Ceil,
  F32Floor,
  F32Trunc,
  F32Nearest,
  F32Sqrt,
  F32Add,
  F32Sub,
  F32Mul,
  F32Div,
  F32Min,
  F32Max,
  F32CopySign,
  F64Abs,
  F64Neg,
  F64Ceil,
  F64Floor,
  F64Trunc,
  F64Nearest,
  F64Sqrt,
  F64Add,
  F64Sub,
  F64Mul,
  F64Div,
  F64Min,
  F64Max,
  F64CopySign,
  I32WrapI64,
  I32TruncF32S,
  I32TruncF32U,
  I32TruncF64S,
  I32TruncF64U,
  I64ExtendI32S,
  I64ExtendI32U,
  I64TruncF32S,
  I64TruncF32U,
  I64TruncF64S,
  I64TruncF64U,
  F32ConvertI32S,
  F32ConvertI32U,
  F32ConvertI64S,
  F32ConvertI64U,
  F32DemoteF64,
  F64ConvertI32S,
  F64ConvertI32U,
  F64ConvertI64S,
  F64ConvertI64U,
  F64PromoteF32,
  I32ReinterpretF32,
  I64ReinterpretF64,
  F32ReinterpretI32,
  F64ReinterpretI64,
  I32Extend8S,
  I32Extend16S,
  I64Extend8S,
  I64Extend16S,
  I64Extend32S,
  // WASM has more instructions than bytes so this
  // prefix indicates we're doing a two byte instr
  Other = 0xfc,
}

export enum OtherInstrType {
  I32TruncSatF32S,
  I32TruncSatF32U,
  I32TruncSatF64S,
  I32TruncSatF64U,
  I64TruncSatF32S,
  I64TruncSatF32U,
  I64TruncSatF64S,
  I64TruncSatF64U,
  MemoryInit,
  DataDrop,
  MemoryCopy,
  MemoryFill,
  TableInit,
  ElemDrop,
  TableCopy,
  TableGrow,
  TableSize,
  TableFill,
}
