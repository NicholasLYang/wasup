import test from 'ava';
import { encodeImportSection, encodeTypeSection } from './encoder';
import { ExternalKind, NumType, RefType } from './wasm';

test('encodeTypeSection', (t) => {
  t.deepEqual(
    encodeTypeSection({
      id: 1,
      types: [{ paramTypes: [NumType.i32], returnTypes: [RefType.funcRef] }],
    }),
    [1, 6, 1, 0x60, 1, 0x7f, 1, 0x70]
  );

  t.deepEqual(
    encodeTypeSection({
      id: 1,
      types: [
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
      imports: [
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
      imports: [
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
