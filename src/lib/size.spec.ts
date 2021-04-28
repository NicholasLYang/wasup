import test from 'ava';

import {
  getFunctionSectionSize,
  getImportSectionSize,
  getTypeSectionSize,
} from './size';

import { ExternalKind, NumType, RefType } from './wasm';

test('getTypeSectionSize', (t) => {
  t.is(
    getTypeSectionSize({
      id: 1,
      types: [
        {
          paramTypes: [NumType.i32, NumType.f32],
          returnTypes: [RefType.funcRef, NumType.i64],
        },
      ],
    }),
    8
  );
});

test('getImportSectionSize', (t) => {
  t.is(
    getImportSectionSize({
      id: 2,
      imports: [
        {
          module: 'std',
          field: 'alloc',
          description: { kind: ExternalKind.Function, typeIndex: 0 },
        },
      ],
    }),
    13
  );
});

test('getFunctionSectionSize', (t) => {
  t.is(
    getFunctionSectionSize({
      id: 3,
      functionTypes: [0, 1, 2, 1],
    }),
    5
  );
});
