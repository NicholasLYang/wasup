import test, { ExecutionContext } from 'ava';

import { createModule } from './builder';
import {
  encodeImportSection,
  encodeModule,
  encodeTypeSection,
} from './encoder';
import { getImportSectionSize, getTypeSectionSize } from './size';
import {
  ExternalKind,
  ImportSection,
  InstrType,
  NumType,
  RefType,
  TypeSection,
} from './wasm';

const emptyModule = createModule();

test('encodeModule', (t) => {
  const localVariables = new Map();
  localVariables.set(NumType.i32, 1);

  t.deepEqual(
    encodeModule({
      ...emptyModule,
      types: {
        id: 1,
        items: [{ paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] }],
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
            code: {
              instructions: [
                [InstrType.LocalGet, 0],
                [InstrType.I32Const, 2],
                [InstrType.I32Mul],
              ],
              length: 5,
            },
          },
        ],
      },
      customSections: [],
    }),
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
      10,
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
    ])
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
    }),
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
      13,
      2,
      0x60,
      1,
      0x7f,
      1,
      0x70,
      0x60,
      2,
      0x7f,
      0x7f,
      2,
      0x70,
      0x7c,
    ])
  );
});

function testTypeSection(
  t: ExecutionContext<unknown>,
  typeSection: TypeSection,
  expected: Uint8Array
) {
  const typeSectionSize = getTypeSectionSize(typeSection);

  const encoder = {
    buffer: new Uint8Array(typeSectionSize),
    sizeInfo: {
      total: typeSectionSize,
      sections: { types: typeSectionSize },
    },
    index: 0,
    textEncoder: new TextEncoder(),
  };

  encodeTypeSection(encoder, typeSection);

  t.deepEqual(encoder.buffer, expected);
}

test('encodeTypeSection', (t) => {
  testTypeSection(
    t,
    {
      id: 1 as const,
      items: [{ paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] }],
    },
    new Uint8Array([1, 6, 1, 0x60, 1, 0x7f, 1, 0x70])
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
      1,
      13,
      2,
      0x60,
      1,
      0x7f,
      1,
      0x70,
      0x60,
      2,
      0x7f,
      0x7f,
      2,
      0x70,
      0x7c,
    ])
  );
});

function testImportSection(
  t: ExecutionContext<unknown>,
  typeSection: ImportSection,
  expected: Uint8Array
) {
  const importSectionSize = getImportSectionSize(typeSection);

  const encoder = {
    buffer: new Uint8Array(importSectionSize),
    sizeInfo: {
      total: importSectionSize,
      sections: { imports: importSectionSize },
    },
    index: 0,
    textEncoder: new TextEncoder(),
  };

  encodeImportSection(encoder, typeSection);

  t.deepEqual(encoder.buffer, expected);
}

test('encodeImportSection', (t) => {
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
    new Uint8Array([2, 13, 1, 3, 115, 116, 100, 5, 97, 108, 108, 111, 99, 0, 0])
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
      2,
      16,
      1,
      3,
      115,
      116,
      100,
      6,
      109,
      101,
      109,
      111,
      114,
      121,
      2,
      1,
      1,
      100,
    ])
  );
});
