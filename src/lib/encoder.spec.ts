import test, { ExecutionContext } from 'ava';

import { createModule } from './builder';
import {
  encodeImportSection,
  encodeInstruction,
  encodeModule,
  encodeTypeSection,
} from './encoder';
import { getLEB128USize } from './leb128';
import {
  getImportSectionSize,
  getInstructionSize,
  getTypeSectionSize,
} from './size';
import {
  ExternalKind,
  ImportSection,
  InstrType,
  Instruction,
  NumType,
  OtherInstrType,
  RefType,
  TypeSection,
  ValueBlockType,
} from './wasm';

const emptyModule = createModule();

test(
  'encodeModule',
  (t) => {
    const localVariables = [{ type: NumType.i32, count: 1 }];

    t.deepEqual(
      encodeModule({
        ...emptyModule,
        types: {
          id: 1,
          items: [
            { paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] },
          ],
        },
        functions: {
          id: 3,
          items: [0],
        },
        start: {
          id: 8,
          startFunction: 0,
        },
        code: {
          id: 10,
          items: [
            {
              locals: localVariables,
              code: [
                [InstrType.LocalGet, 0],
                [InstrType.I32Const, 2],
                [InstrType.I32Mul],
              ],
            },
          ],
        },
        customSections: [],
      },),
      new Uint8Array([
        0x00,
        0x61,
        0x73,
        0x6d,
        0x01,
        0x00,
        0x00,
        0x00,
        1,
        6,
        1,
        0x60,
        1,
        0x7f,
        1,
        0x70,
        3,
        2,
        1,
        0,
        8,
        1,
        0,
        0x0a,
        11,
        1,
        9,
        1, // vec of locals w/length 1
        1, // 1 local variable...
        0x7f, // ..of type i32
        0x20, // local.get
        0, // 0
        0x41, // i32.const
        2, // 2
        0x6c, // i32.mul
        0x0b, // end
      ],),
    );

    t.deepEqual(
      encodeModule({
        ...emptyModule,
        types: {
          id: 1,
          items: [
            { paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] },
            {
              paramTypes: [NumType.i32, NumType.i32],
              returnTypes: [RefType.funcRef, NumType.f64],
            },
          ],
        },
        customSections: [],
      },),
      new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 1, 13, 2, 0x60, 1, 0x7f,
        1, 0x70, 0x60, 2, 0x7f, 0x7f, 2, 0x70, 0x7c,
      ],),
    );
  },
);

function testTypeSection(
  t: ExecutionContext<unknown>,
  typeSection: TypeSection,
  expected: Uint8Array,
) {
  const typeSectionSize = getTypeSectionSize(typeSection);
  const typeSectionSizeWithPreamble =
    1 + getLEB128USize(typeSectionSize) + typeSectionSize;

  const encoder = {
    buffer: new Uint8Array(typeSectionSizeWithPreamble),
    sizeInfo: {
      total: typeSectionSizeWithPreamble,
      sections: {
        types: typeSectionSize,
        imports: 0,
        functions: 0,
        tables: 0,
        memories: 0,
        globals: 0,
        exports: 0,
        start: 0,
        elements: 0,
        code: 0,
        data: 0,
        dataCount: 0,
        customSections: 0,
      },
    },
    index: 0,
    textEncoder: new TextEncoder(),
  };

  encodeTypeSection(encoder, typeSection);

  t.deepEqual(expected, encoder.buffer);
}

test(
  'encodeTypeSection',
  (t) => {
    testTypeSection(
      t,
      {
        id: 1 as const,
        items: [{ paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] }],
      },
      new Uint8Array([1, 6, 1, 0x60, 1, 0x7f, 1, 0x70]),
    );

    testTypeSection(
      t,
      {
        id: 1,
        items: [
          { paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] },
          {
            paramTypes: [NumType.i32, NumType.i32],
            returnTypes: [RefType.funcRef, NumType.f64],
          },
        ],
      },
      new Uint8Array([
        1, 13, 2, 0x60, 1, 0x7f, 1, 0x70, 0x60, 2, 0x7f, 0x7f, 2, 0x70, 0x7c,
      ],),
    );
  },
);

function testImportSection(
  t: ExecutionContext<unknown>,
  importSection: ImportSection,
  expected: Uint8Array,
) {
  const importSectionSize = getImportSectionSize(importSection);
  const importSectionSizeWithPreamble =
    1 + getLEB128USize(importSectionSize) + importSectionSize;

  const encoder = {
    buffer: new Uint8Array(importSectionSizeWithPreamble),
    sizeInfo: {
      total: importSectionSizeWithPreamble,
      sections: {
        types: 0,
        imports: importSectionSize,
        functions: 0,
        tables: 0,
        memories: 0,
        globals: 0,
        exports: 0,
        start: 0,
        elements: 0,
        code: 0,
        data: 0,
        dataCount: 0,
        customSections: 0,
      },
    },
    index: 0,
    textEncoder: new TextEncoder(),
  };

  encodeImportSection(encoder, importSection);

  t.deepEqual(encoder.buffer, expected);
}

test(
  'encodeImportSection',
  (t) => {
    testImportSection(
      t,
      {
        id: 2,
        items: [
          {
            module: 'std',
            field: 'alloc',
            description: { kind: ExternalKind.Function, typeIndex: 0 },
          },
        ],
      },
      new Uint8Array([
        2, 13, 1, 3, 115, 116, 100, 5, 97, 108, 108, 111, 99, 0, 0,
      ],),
    );

    testImportSection(
      t,
      {
        id: 2,
        items: [
          {
            module: 'std',
            field: 'memory',
            description: {
              kind: ExternalKind.Memory,
              memoryType: { minimum: 1, maximum: 100 },
            },
          },
        ],
      },
      new Uint8Array([
        2, 16, 1, 3, 115, 116, 100, 6, 109, 101, 109, 111, 114, 121, 2, 1, 1,
        100,
      ],),
    );
  },
);

function testEncodeInstruction(
  t: ExecutionContext<unknown>,
  instr: Instruction,
  expected: Uint8Array,
) {
  const instrSize = getInstructionSize(instr);

  const encoder = {
    buffer: new Uint8Array(instrSize),
    sizeInfo: {
      total: instrSize,
      sections: {
        types: 0,
        imports: 0,
        functions: 0,
        tables: 0,
        memories: 0,
        globals: 0,
        exports: 0,
        start: 0,
        elements: 0,
        code: 0,
        data: 0,
        dataCount: 0,
        customSections: 0,
      },
    },
    index: 0,
    textEncoder: new TextEncoder(),
  };

  encodeInstruction(encoder, instr);

  t.deepEqual(encoder.buffer, expected);
}

test(
  'encodeInstruction',
  (t) => {
    testEncodeInstruction(
      t,
      [InstrType.Unreachable],
      new Uint8Array([InstrType.Unreachable]),
    );
    testEncodeInstruction(t, [InstrType.Nop], new Uint8Array([InstrType.Nop]));
    testEncodeInstruction(
      t,
      [InstrType.Return],
      new Uint8Array([InstrType.Return]),
    );
    testEncodeInstruction(
      t,
      [InstrType.RefIsNull],
      new Uint8Array([InstrType.RefIsNull]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Drop],
      new Uint8Array([InstrType.Drop]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Select],
      new Uint8Array([InstrType.Select]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32EqZ],
      new Uint8Array([InstrType.I32EqZ]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Eq],
      new Uint8Array([InstrType.I32Eq]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Ne],
      new Uint8Array([InstrType.I32Ne]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32LtS],
      new Uint8Array([InstrType.I32LtS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32LtU],
      new Uint8Array([InstrType.I32LtU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32GtS],
      new Uint8Array([InstrType.I32GtS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32GtU],
      new Uint8Array([InstrType.I32GtU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32LeS],
      new Uint8Array([InstrType.I32LeS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32LeU],
      new Uint8Array([InstrType.I32LeU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32GeS],
      new Uint8Array([InstrType.I32GeS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32GeU],
      new Uint8Array([InstrType.I32GeU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64EqZ],
      new Uint8Array([InstrType.I64EqZ]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Eq],
      new Uint8Array([InstrType.I64Eq]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Ne],
      new Uint8Array([InstrType.I64Ne]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64LtS],
      new Uint8Array([InstrType.I64LtS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64LtU],
      new Uint8Array([InstrType.I64LtU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64GtS],
      new Uint8Array([InstrType.I64GtS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64GtU],
      new Uint8Array([InstrType.I64GtU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64LeS],
      new Uint8Array([InstrType.I64LeS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64LeU],
      new Uint8Array([InstrType.I64LeU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64GeS],
      new Uint8Array([InstrType.I64GeS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64GeU],
      new Uint8Array([InstrType.I64GeU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Eq],
      new Uint8Array([InstrType.F32Eq]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Ne],
      new Uint8Array([InstrType.F32Ne]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Lt],
      new Uint8Array([InstrType.F32Lt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Gt],
      new Uint8Array([InstrType.F32Gt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Le],
      new Uint8Array([InstrType.F32Le]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Ge],
      new Uint8Array([InstrType.F32Ge]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Eq],
      new Uint8Array([InstrType.F64Eq]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Ne],
      new Uint8Array([InstrType.F64Ne]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Lt],
      new Uint8Array([InstrType.F64Lt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Gt],
      new Uint8Array([InstrType.F64Gt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Le],
      new Uint8Array([InstrType.F64Le]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Ge],
      new Uint8Array([InstrType.F64Ge]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Clz],
      new Uint8Array([InstrType.I32Clz]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Ctz],
      new Uint8Array([InstrType.I32Ctz]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Popcnt],
      new Uint8Array([InstrType.I32Popcnt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Add],
      new Uint8Array([InstrType.I32Add]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Sub],
      new Uint8Array([InstrType.I32Sub]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Mul],
      new Uint8Array([InstrType.I32Mul]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32DivS],
      new Uint8Array([InstrType.I32DivS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32DivU],
      new Uint8Array([InstrType.I32DivU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32RemS],
      new Uint8Array([InstrType.I32RemS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32RemU],
      new Uint8Array([InstrType.I32RemU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32And],
      new Uint8Array([InstrType.I32And]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Or],
      new Uint8Array([InstrType.I32Or]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Xor],
      new Uint8Array([InstrType.I32Xor]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Shl],
      new Uint8Array([InstrType.I32Shl]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32ShrS],
      new Uint8Array([InstrType.I32ShrS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32ShrU],
      new Uint8Array([InstrType.I32ShrU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Rotl],
      new Uint8Array([InstrType.I32Rotl]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Rotr],
      new Uint8Array([InstrType.I32Rotr]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Clz],
      new Uint8Array([InstrType.I64Clz]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Ctz],
      new Uint8Array([InstrType.I64Ctz]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Popcnt],
      new Uint8Array([InstrType.I64Popcnt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Add],
      new Uint8Array([InstrType.I64Add]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Sub],
      new Uint8Array([InstrType.I64Sub]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Mul],
      new Uint8Array([InstrType.I64Mul]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64DivS],
      new Uint8Array([InstrType.I64DivS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64DivU],
      new Uint8Array([InstrType.I64DivU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64RemS],
      new Uint8Array([InstrType.I64RemS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64RemU],
      new Uint8Array([InstrType.I64RemU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64And],
      new Uint8Array([InstrType.I64And]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Or],
      new Uint8Array([InstrType.I64Or]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Xor],
      new Uint8Array([InstrType.I64Xor]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Shl],
      new Uint8Array([InstrType.I64Shl]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64ShrS],
      new Uint8Array([InstrType.I64ShrS]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64ShrU],
      new Uint8Array([InstrType.I64ShrU]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Rotl],
      new Uint8Array([InstrType.I64Rotl]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Rotr],
      new Uint8Array([InstrType.I64Rotr]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Abs],
      new Uint8Array([InstrType.F32Abs]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Neg],
      new Uint8Array([InstrType.F32Neg]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Ceil],
      new Uint8Array([InstrType.F32Ceil]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Floor],
      new Uint8Array([InstrType.F32Floor]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Trunc],
      new Uint8Array([InstrType.F32Trunc]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Nearest],
      new Uint8Array([InstrType.F32Nearest]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Sqrt],
      new Uint8Array([InstrType.F32Sqrt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Add],
      new Uint8Array([InstrType.F32Add]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Sub],
      new Uint8Array([InstrType.F32Sub]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Mul],
      new Uint8Array([InstrType.F32Mul]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Div],
      new Uint8Array([InstrType.F32Div]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Min],
      new Uint8Array([InstrType.F32Min]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Max],
      new Uint8Array([InstrType.F32Max]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32CopySign],
      new Uint8Array([InstrType.F32CopySign]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Abs],
      new Uint8Array([InstrType.F64Abs]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Neg],
      new Uint8Array([InstrType.F64Neg]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Ceil],
      new Uint8Array([InstrType.F64Ceil]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Floor],
      new Uint8Array([InstrType.F64Floor]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Trunc],
      new Uint8Array([InstrType.F64Trunc]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Nearest],
      new Uint8Array([InstrType.F64Nearest]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Sqrt],
      new Uint8Array([InstrType.F64Sqrt]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Add],
      new Uint8Array([InstrType.F64Add]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Sub],
      new Uint8Array([InstrType.F64Sub]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Mul],
      new Uint8Array([InstrType.F64Mul]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Div],
      new Uint8Array([InstrType.F64Div]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Min],
      new Uint8Array([InstrType.F64Min]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Max],
      new Uint8Array([InstrType.F64Max]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64CopySign],
      new Uint8Array([InstrType.F64CopySign]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32WrapI64],
      new Uint8Array([InstrType.I32WrapI64]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32TruncF32S],
      new Uint8Array([InstrType.I32TruncF32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32TruncF32U],
      new Uint8Array([InstrType.I32TruncF32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32TruncF64S],
      new Uint8Array([InstrType.I32TruncF64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32TruncF64U],
      new Uint8Array([InstrType.I32TruncF64U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64ExtendI32S],
      new Uint8Array([InstrType.I64ExtendI32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64ExtendI32U],
      new Uint8Array([InstrType.I64ExtendI32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64TruncF32S],
      new Uint8Array([InstrType.I64TruncF32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64TruncF32U],
      new Uint8Array([InstrType.I64TruncF32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64TruncF64S],
      new Uint8Array([InstrType.I64TruncF64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64TruncF64U],
      new Uint8Array([InstrType.I64TruncF64U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32ConvertI32S],
      new Uint8Array([InstrType.F32ConvertI32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32ConvertI32U],
      new Uint8Array([InstrType.F32ConvertI32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32ConvertI64S],
      new Uint8Array([InstrType.F32ConvertI64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32ConvertI64U],
      new Uint8Array([InstrType.F32ConvertI64U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32DemoteF64],
      new Uint8Array([InstrType.F32DemoteF64]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64ConvertI32S],
      new Uint8Array([InstrType.F64ConvertI32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64ConvertI32U],
      new Uint8Array([InstrType.F64ConvertI32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64ConvertI64S],
      new Uint8Array([InstrType.F64ConvertI64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64ConvertI64U],
      new Uint8Array([InstrType.F64ConvertI64U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64PromoteF32],
      new Uint8Array([InstrType.F64PromoteF32]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32ReinterpretF32],
      new Uint8Array([InstrType.I32ReinterpretF32]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64ReinterpretF64],
      new Uint8Array([InstrType.I64ReinterpretF64]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32ReinterpretI32],
      new Uint8Array([InstrType.F32ReinterpretI32]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64ReinterpretI64],
      new Uint8Array([InstrType.F64ReinterpretI64]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Extend8S],
      new Uint8Array([InstrType.I32Extend8S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Extend16S],
      new Uint8Array([InstrType.I32Extend16S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Extend8S],
      new Uint8Array([InstrType.I64Extend8S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Extend16S],
      new Uint8Array([InstrType.I64Extend16S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Extend32S],
      new Uint8Array([InstrType.I64Extend32S]),
    );
    testEncodeInstruction(
      t,
      [
        InstrType.Block,
        { valueType: ValueBlockType.Empty },
        [[InstrType.I32Const, 10], [InstrType.LocalGet, 0], [InstrType.I32Add]],
      ],
      new Uint8Array([
        InstrType.Block,
        0x40,
        InstrType.I32Const,
        10,
        InstrType.LocalGet,
        0,
        InstrType.I32Add,
        0x0b,
      ],),
    );
    testEncodeInstruction(
      t,
      [InstrType.Loop, { typeIndex: 0 }, []],
      new Uint8Array([InstrType.Loop, 0, 0x0b]),
    );
    testEncodeInstruction(
      t,
      [InstrType.If, { valueType: ValueBlockType.i32 }, [[InstrType.Call, 10]]],
      new Uint8Array([InstrType.If, 0x7f, InstrType.Call, 10, 0x0b]),
    );
    testEncodeInstruction(
      t,
      [
        InstrType.If,
        { valueType: ValueBlockType.i32 },
        [[InstrType.Call, 10]],
        [[InstrType.Call, 11], [InstrType.GlobalGet, 0], [InstrType.I32Mul]],
      ],
      new Uint8Array([
        InstrType.If,
        0x7f,
        InstrType.Call,
        10,
        0x05,
        InstrType.Call,
        11,
        InstrType.GlobalGet,
        0,
        InstrType.I32Mul,
        0x0b,
      ],),
    );

    testEncodeInstruction(
      t,
      [InstrType.Br, 2],
      new Uint8Array([InstrType.Br, 2]),
    );

    testEncodeInstruction(
      t,
      [InstrType.BrIf, 0],
      new Uint8Array([InstrType.BrIf, 0]),
    );
    const tableIds = [0, 5, 120, 34];
    const endId = 25;

    testEncodeInstruction(
      t,
      [InstrType.BrTable, tableIds, endId],
      new Uint8Array([InstrType.BrTable, 4, 0, 5, 120, 34, 25]),
    );

    testEncodeInstruction(
      t,
      [InstrType.Call, 1],
      new Uint8Array([InstrType.Call, 1]),
    );
    testEncodeInstruction(
      t,
      [InstrType.CallIndirect, 0, 25],
      new Uint8Array([InstrType.CallIndirect, 0, 25]),
    );
    testEncodeInstruction(
      t,
      [InstrType.RefNull, RefType.funcRef],
      new Uint8Array([InstrType.RefNull, RefType.funcRef]),
    );

    testEncodeInstruction(
      t,
      [InstrType.RefFunc, 128],
      new Uint8Array([InstrType.RefFunc, 0x80, 0x01]),
    );
    // testEncodeInstruction(t, [InstrType.SelectT, ValueType[]]);
    // testEncodeInstruction(t, [InstrType.LocalGet, number]);
    // testEncodeInstruction(t, [InstrType.LocalSet, number]);
    // testEncodeInstruction(t, [InstrType.LocalTee, number]);
    // testEncodeInstruction(t, [InstrType.GlobalGet, number]);
    // testEncodeInstruction(t, [InstrType.GlobalSet, number]);
    // testEncodeInstruction(t, [InstrType.TableGet, number]);
    // testEncodeInstruction(t, [InstrType.TableSet, number]);
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I32TruncSatF32S],
      new Uint8Array([InstrType.Other, OtherInstrType.I32TruncSatF32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I32TruncSatF32U],
      new Uint8Array([InstrType.Other, OtherInstrType.I32TruncSatF32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I32TruncSatF64S],
      new Uint8Array([InstrType.Other, OtherInstrType.I32TruncSatF64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I32TruncSatF64U],
      new Uint8Array([InstrType.Other, OtherInstrType.I32TruncSatF64U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I64TruncSatF32S],
      new Uint8Array([InstrType.Other, OtherInstrType.I64TruncSatF32S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I64TruncSatF32U],
      new Uint8Array([InstrType.Other, OtherInstrType.I64TruncSatF32U]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I64TruncSatF64S],
      new Uint8Array([InstrType.Other, OtherInstrType.I64TruncSatF64S]),
    );
    testEncodeInstruction(
      t,
      [InstrType.Other, OtherInstrType.I64TruncSatF64U],
      new Uint8Array([InstrType.Other, OtherInstrType.I64TruncSatF64U]),
    );
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.MemoryInit, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.DataDrop, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.MemoryCopy]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.MemoryFill]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.TableInit, number, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.ElemDrop, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.TableCopy, number, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.TableGrow, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.TableSize, number]);
    // testEncodeInstruction(t, [InstrType.Other, OtherInstrType.TableFill, number]);
    // testEncodeInstruction(t, [InstrType.I32Load, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load, number, number]);
    // testEncodeInstruction(t, [InstrType.F32Load, number, number]);
    // testEncodeInstruction(t, [InstrType.F64Load, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Load8S, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Load8U, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Load16S, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Load16U, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load8S, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load8U, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load16S, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load16U, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load32S, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Load32U, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Store, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Store, number, number]);
    // testEncodeInstruction(t, [InstrType.F32Store, number, number]);
    // testEncodeInstruction(t, [InstrType.F64Store, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Store8, number, number]);
    // testEncodeInstruction(t, [InstrType.I32Store16, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Store8, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Store16, number, number]);
    // testEncodeInstruction(t, [InstrType.I64Store32, number, number]);

    testEncodeInstruction(
      t,
      [InstrType.MemorySize],
      new Uint8Array([InstrType.MemorySize, 0x00]),
    );
    testEncodeInstruction(
      t,
      [InstrType.MemoryGrow],
      new Uint8Array([InstrType.MemoryGrow, 0x00]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I32Const, 64],
      new Uint8Array([InstrType.I32Const, 0xc0, 0x00]),
    );
    testEncodeInstruction(
      t,
      [InstrType.I64Const, 128],
      new Uint8Array([InstrType.I64Const, 0x80, 0x01]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F32Const, 2.6],
      new Uint8Array([InstrType.F32Const, 0x66, 0x66, 0x26, 0x40]),
    );
    testEncodeInstruction(
      t,
      [InstrType.F64Const, 3.1],
      new Uint8Array([
        InstrType.F64Const,
        0xcd,
        0xcc,
        0xcc,
        0xcc,
        0xcc,
        0xcc,
        0x08,
        0x40,
      ],),
    );
  },
);
