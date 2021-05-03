import test from 'ava';
import { createModule } from './builder';
import {
  encodeImportSection,
  encodeModule,
  encodeTypeSection,
} from './encoder';
import { ExternalKind, NumType, RefType } from './wasm';

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
        items: [{ locals: localVariables, code: [0x20, 0, 0x41, 2, 0x6c] }],
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

test('encodeTypeSection', (t) => {
  t.deepEqual(
    encodeTypeSection({
      id: 1,
      items: [{ paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] }],
    }),
    [1, 6, 1, 0x60, 1, 0x7f, 1, 0x70]
  );

  t.deepEqual(
    encodeTypeSection({
      id: 1,
      items: [
        { paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] },
        {
          paramTypes: [NumType.i32, NumType.i32],
          returnTypes: [RefType.funcRef, NumType.f64],
        },
      ],
    }),
    [1, 13, 2, 0x60, 1, 0x7f, 1, 0x70, 0x60, 2, 0x7f, 0x7f, 2, 0x70, 0x7c]
  );
});

test('encodeImportSection', (t) => {
  t.deepEqual(
    encodeImportSection({
      id: 2,
      items: [
        {
          module: 'std',
          field: 'alloc',
          description: { kind: ExternalKind.Function, typeIndex: 0 },
        },
      ],
    }),
    [2, 13, 1, 3, 115, 116, 100, 5, 97, 108, 108, 111, 99, 0, 0]
  );

  t.deepEqual(
    encodeImportSection({
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
    }),
    [2, 16, 1, 3, 115, 116, 100, 6, 109, 101, 109, 111, 114, 121, 2, 1, 1, 100]
  );
});
