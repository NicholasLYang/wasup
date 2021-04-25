enum ValueType {
  i32 = 0x7f,
  i64 = 0x7e,
  f32 = 0x7d,
  f64 = 0x7c,
  funcRef = 0x70,
  externRef = 0x6f
}

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
  
}

interface TableSection {
  tables: TableType[]
}
interface MemorySection {}
interface GlobalSection {}
interface ElementSection {
}

interface DataSection {
}

interface StartSection {
}

interface ExportSection {
}

// Can be extended for any custom section
interface CustomSection {
  id: 0,
  name: string,
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
  import: ImportSection,
  export: ExportSection,
}

export const VERSION = 0x1;
export const MAGIC_NUMBER = 0x6d736100;
