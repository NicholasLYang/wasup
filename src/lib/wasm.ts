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

// This is a separate type because
// we need this type to be encoded
// as a signed LEB128
export enum ValueBlockType {
  i32 = -0x01,
  i64 = -0x02,
  f32 = -0x03,
  f64 = -0x04,
  AnyFunc = -0x20,
  Empty = -0x40,
}

export type BlockType = { valueType: ValueBlockType } | { typeIndex: number };

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
  initExpr: Instruction[];
}

export enum ElementKind {
  FuncRef = 0x00,
}

export type Element =
  | {
      id: 0x00; // Active mode
      offsetExpr: Instruction[];
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
      offsetExpr: Instruction[];
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
      offsetExpr: Instruction[];
      initExprs: Instruction[][];
    }
  | {
      id: 0x05; // Passive
      refType: RefType;
      initExprs: Instruction[][];
    }
  | {
      id: 0x06; // Active
      tableIndex: number;
      offsetExpr: Instruction[];
      refType: RefType;
      initExprs: Instruction[][];
    }
  | {
      id: 0x07; // Declarative
      refType: RefType;
      initExprs: Instruction[][];
    };

export type LocalVariables = Map<ValueType, number>;

export interface Code {
  locals: LocalVariables;
  code: Instruction[];
}

export type Data =
  | {
      id: 0x00;
      offsetExpr: Instruction[];
      bytes: Uint8Array;
    }
  | {
      id: 0x01;
      bytes: Uint8Array;
    }
  | {
      id: 0x02;
      memoryIndex: number;
      offsetExpr: Instruction[];
      bytes: Uint8Array;
    };

export interface Export {
  name: string;
  kind: ExternalKind;
  index: number;
}

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

export enum InstrType {
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
  TableGet,
  TableSet,
  I32Load = 0x28,
  I64Load,
  F32Load,
  F64Load,
  I32Load8S,
  I32Load8U,
  I32Load16S,
  I32Load16U,
  I64Load8S,
  I64Load8U,
  I64Load16S,
  I64Load16U,
  I64Load32S,
  I64Load32U,
  I32Store,
  I64Store,
  F32Store,
  F64Store,
  I32Store8,
  I32Store16,
  I64Store8,
  I64Store16,
  I64Store32,
  MemorySize,
  MemoryGrow,
  I32Const,
  I64Const,
  F32Const,
  F64Const,
  I32EqZ,
  I32Eq,
  I32Ne,
  I32LtS,
  I32LtU,
  I32GtS,
  I32GtU,
  I32LeS,
  I32LeU,
  I32GeS,
  I32GeU,
  I64EqZ,
  I64Eq,
  I64Ne,
  I64LtS,
  I64LtU,
  I64GtS,
  I64GtU,
  I64LeS,
  I64LeU,
  I64GeS,
  I64GeU,
  F32Eq,
  F32Ne,
  F32Lt,
  F32Gt,
  F32Le,
  F32Ge,
  F64Eq,
  F64Ne,
  F64Lt,
  F64Gt,
  F64Le,
  F64Ge,
  I32Clz,
  I32Ctz,
  I32Popcnt,
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

export type Instruction =
  | [InstrType.Unreachable]
  | [InstrType.Nop]
  | [InstrType.Return]
  | [InstrType.RefIsNull]
  | [InstrType.Drop]
  | [InstrType.Select]
  | [InstrType.I32EqZ]
  | [InstrType.I32Eq]
  | [InstrType.I32Ne]
  | [InstrType.I32LtS]
  | [InstrType.I32LtU]
  | [InstrType.I32GtS]
  | [InstrType.I32GtU]
  | [InstrType.I32LeS]
  | [InstrType.I32LeU]
  | [InstrType.I32GeS]
  | [InstrType.I32GeU]
  | [InstrType.I64EqZ]
  | [InstrType.I64Eq]
  | [InstrType.I64Ne]
  | [InstrType.I64LtS]
  | [InstrType.I64LtU]
  | [InstrType.I64GtS]
  | [InstrType.I64GtU]
  | [InstrType.I64LeS]
  | [InstrType.I64LeU]
  | [InstrType.I64GeS]
  | [InstrType.I64GeU]
  | [InstrType.F32Eq]
  | [InstrType.F32Ne]
  | [InstrType.F32Lt]
  | [InstrType.F32Gt]
  | [InstrType.F32Le]
  | [InstrType.F32Ge]
  | [InstrType.F64Eq]
  | [InstrType.F64Ne]
  | [InstrType.F64Lt]
  | [InstrType.F64Gt]
  | [InstrType.F64Le]
  | [InstrType.F64Ge]
  | [InstrType.I32Clz]
  | [InstrType.I32Ctz]
  | [InstrType.I32Popcnt]
  | [InstrType.I32Add]
  | [InstrType.I32Sub]
  | [InstrType.I32Mul]
  | [InstrType.I32DivS]
  | [InstrType.I32DivU]
  | [InstrType.I32RemS]
  | [InstrType.I32RemU]
  | [InstrType.I32And]
  | [InstrType.I32Or]
  | [InstrType.I32Xor]
  | [InstrType.I32Shl]
  | [InstrType.I32ShrS]
  | [InstrType.I32ShrU]
  | [InstrType.I32Rotl]
  | [InstrType.I32Rotr]
  | [InstrType.I64Clz]
  | [InstrType.I64Ctz]
  | [InstrType.I64Popcnt]
  | [InstrType.I64Add]
  | [InstrType.I64Sub]
  | [InstrType.I64Mul]
  | [InstrType.I64DivS]
  | [InstrType.I64DivU]
  | [InstrType.I64RemS]
  | [InstrType.I64RemU]
  | [InstrType.I64And]
  | [InstrType.I64Or]
  | [InstrType.I64Xor]
  | [InstrType.I64Shl]
  | [InstrType.I64ShrS]
  | [InstrType.I64ShrU]
  | [InstrType.I64Rotl]
  | [InstrType.I64Rotr]
  | [InstrType.F32Abs]
  | [InstrType.F32Neg]
  | [InstrType.F32Ceil]
  | [InstrType.F32Floor]
  | [InstrType.F32Trunc]
  | [InstrType.F32Nearest]
  | [InstrType.F32Sqrt]
  | [InstrType.F32Add]
  | [InstrType.F32Sub]
  | [InstrType.F32Mul]
  | [InstrType.F32Div]
  | [InstrType.F32Min]
  | [InstrType.F32Max]
  | [InstrType.F32CopySign]
  | [InstrType.F64Abs]
  | [InstrType.F64Neg]
  | [InstrType.F64Ceil]
  | [InstrType.F64Floor]
  | [InstrType.F64Trunc]
  | [InstrType.F64Nearest]
  | [InstrType.F64Sqrt]
  | [InstrType.F64Add]
  | [InstrType.F64Sub]
  | [InstrType.F64Mul]
  | [InstrType.F64Div]
  | [InstrType.F64Min]
  | [InstrType.F64Max]
  | [InstrType.F64CopySign]
  | [InstrType.I32WrapI64]
  | [InstrType.I32TruncF32S]
  | [InstrType.I32TruncF32U]
  | [InstrType.I32TruncF64S]
  | [InstrType.I32TruncF64U]
  | [InstrType.I64ExtendI32S]
  | [InstrType.I64ExtendI32U]
  | [InstrType.I64TruncF32S]
  | [InstrType.I64TruncF32U]
  | [InstrType.I64TruncF64S]
  | [InstrType.I64TruncF64U]
  | [InstrType.F32ConvertI32S]
  | [InstrType.F32ConvertI32U]
  | [InstrType.F32ConvertI64S]
  | [InstrType.F32ConvertI64U]
  | [InstrType.F32DemoteF64]
  | [InstrType.F64ConvertI32S]
  | [InstrType.F64ConvertI32U]
  | [InstrType.F64ConvertI64S]
  | [InstrType.F64ConvertI64U]
  | [InstrType.F64PromoteF32]
  | [InstrType.I32ReinterpretF32]
  | [InstrType.I64ReinterpretF64]
  | [InstrType.F32ReinterpretI32]
  | [InstrType.F64ReinterpretI64]
  | [InstrType.I32Extend8S]
  | [InstrType.I32Extend16S]
  | [InstrType.I64Extend8S]
  | [InstrType.I64Extend16S]
  | [InstrType.I64Extend32S]
  | [InstrType.Block, BlockType, Instruction[]]
  | [InstrType.Loop, BlockType, Instruction[]]
  | [InstrType.If, BlockType, Instruction[], Instruction[]]
  | [InstrType.Else]
  | [InstrType.Br, number]
  | [InstrType.BrIf, number]
  | [InstrType.BrTable, ...number[]]
  | [InstrType.Call, number]
  | [InstrType.CallIndirect, number, number]
  | [InstrType.RefNull, RefType]
  | [InstrType.RefFunc, number]
  | [InstrType.SelectT, ...ValueType[]]
  | [InstrType.LocalGet, number]
  | [InstrType.LocalSet, number]
  | [InstrType.LocalTee, number]
  | [InstrType.GlobalGet, number]
  | [InstrType.GlobalSet, number]
  | [InstrType.TableGet, number]
  | [InstrType.TableSet, number]
  | [InstrType.Other, OtherInstrType.I32TruncSatF32S]
  | [InstrType.Other, OtherInstrType.I32TruncSatF32U]
  | [InstrType.Other, OtherInstrType.I32TruncSatF64S]
  | [InstrType.Other, OtherInstrType.I32TruncSatF64U]
  | [InstrType.Other, OtherInstrType.I64TruncSatF32S]
  | [InstrType.Other, OtherInstrType.I64TruncSatF32U]
  | [InstrType.Other, OtherInstrType.I64TruncSatF64S]
  | [InstrType.Other, OtherInstrType.I64TruncSatF64U]
  | [InstrType.Other, OtherInstrType.MemoryInit, number]
  | [InstrType.Other, OtherInstrType.DataDrop, number]
  | [InstrType.Other, OtherInstrType.MemoryCopy]
  | [InstrType.Other, OtherInstrType.MemoryFill]
  | [InstrType.Other, OtherInstrType.TableInit, number, number]
  | [InstrType.Other, OtherInstrType.ElemDrop, number]
  | [InstrType.Other, OtherInstrType.TableCopy, number, number]
  | [InstrType.Other, OtherInstrType.TableGrow, number]
  | [InstrType.Other, OtherInstrType.TableSize, number]
  | [InstrType.Other, OtherInstrType.TableFill, number]
  | [InstrType.I32Load, number, number]
  | [InstrType.I64Load, number, number]
  | [InstrType.F32Load, number, number]
  | [InstrType.F64Load, number, number]
  | [InstrType.I32Load8S, number, number]
  | [InstrType.I32Load8U, number, number]
  | [InstrType.I32Load16S, number, number]
  | [InstrType.I32Load16U, number, number]
  | [InstrType.I64Load8S, number, number]
  | [InstrType.I64Load8U, number, number]
  | [InstrType.I64Load16S, number, number]
  | [InstrType.I64Load16U, number, number]
  | [InstrType.I64Load32S, number, number]
  | [InstrType.I64Load32U, number, number]
  | [InstrType.I32Store, number, number]
  | [InstrType.I64Store, number, number]
  | [InstrType.F32Store, number, number]
  | [InstrType.F64Store, number, number]
  | [InstrType.I32Store8, number, number]
  | [InstrType.I32Store16, number, number]
  | [InstrType.I64Store8, number, number]
  | [InstrType.I64Store16, number, number]
  | [InstrType.I64Store32, number, number]
  | [InstrType.MemorySize]
  | [InstrType.MemoryGrow]
  | [InstrType.I32Const, number]
  | [InstrType.I64Const, number]
  | [InstrType.F32Const, number]
  | [InstrType.F64Const, number];
