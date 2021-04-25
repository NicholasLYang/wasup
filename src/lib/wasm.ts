type FuncId = number;

enum NumType {
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
}

enum RefType {
  funcRef = 0x70,
  externRef = 0x6f
}

type ValueType = RefType | NumType;

interface FuncType {
  paramTypes: ValueType[],
  returnType?: ValueType
}

interface TypeSection {
  id: 1,
  types: FuncType[]
}

enum ExternalKind {
  Function = 0,
  Table = 1,
  Memory = 2,
  Global = 3
}

interface ImportEntry {
  module: string;
  field: string;
  kind: ExternalKind
}

interface ImportSection {
  id: 2,
  imports: ImportEntry[]
}

interface FunctionSection {
  id: 3;
  // indices into types section
  types: number[]
}

interface TableType {
  elementType: RefType
  limits: ResizableLimits
}

interface TableSection {
  tables: TableType[]
}

interface ResizableLimits {
  initial: number;
  maximum?: number
}

interface MemorySection {
  id: 5,
  memories: ResizableLimits[]
}

interface Global {
  type: ValueType;
  mutability: boolean;
  init: OpCode[]
}

interface GlobalSection {
  id: 6,
  globals: Global[]
}

enum ElementKind {
  FuncRef = 0x00
}

type ElementMode = {
  id: 0x00, // Active mode
  offsetExpr: OpCode[],
  functionIds: FuncId[]
} | {
  id: 0x01, // Passive
  elementKind: ElementKind
  functionIds: FuncId[]
} | {
  id: 0x02, // Active
  tableIndex: number,
  offsetExpr: OpCode[],
  elementKind: ElementKind,
  functionIds: FuncId[]
} | {
  id: 0x03, // Declarative
  elementKind: ElementKind,
  functionIds: FuncId[]
} | {
  id: 0x04, // Active
  offsetExpr: OpCode[],
  initExprs: OpCode[][]
} | {
  id: 0x05, // Passive
  refType: RefType,
  initExprs: OpCode[][]
} | {
  id: 0x06, // Active
  tableIndeX: number,
  offsetExpr: OpCode[],
  refType: RefType,
  initExprs: OpCode[][]
} | {
  id: 0x07, // Declarative
  refType: RefType,
  initExprs: OpCode[][]
}

interface Element {
  type: RefType,
  init: OpCode[][],
  mode: ElementMode
}

interface ElementSection {
  id: 9,
  elements: Element
}

interface FunctionBody {
  locals: { [valueType in ValueType]: number },
  code: OpCode[]
}

interface CodeSection {
  id: 10,
  code: FunctionBody[]
}

type Data = {
  id: 0x00,
  offsetExpr: OpCode[],
  bytes: Uint8Array,
} | {
  id: 0x01,
  bytes: Uint8Array,
} | {
  id: 0x02,
  memoryIndex: number,
  offsetExpr: OpCode[],
  bytes: []
}

interface DataSection {
  id: 11,
  data: Data[]
}

interface Export {
  name: string,
  kind: ExternalKind,
  index: number
}

interface ExportSection {
  id: 7,
  exports: Export[]
}

interface StartSection {
  id: 8,
  startFunction: number
}

// Can be extended for any custom section
interface CustomSection {
  id: 0,
  name: string,
}

enum OpCode {

}

interface Module {
  types: TypeSection,
  functions: FunctionSection,
  tables: TableSection,
  memories: MemorySection,
  globals: GlobalSection,
  elements: ElementSection,
  data: DataSection,
  start: StartSection,
  imports: ImportSection,
  exports: ExportSection,
  code: CodeSection,
  customSections: CustomSection[]
}

export function emitModule(module: Module) {
  console.log(module);
}
export const VERSION = 0x1;
export const MAGIC_NUMBER = 0x6d736100;
