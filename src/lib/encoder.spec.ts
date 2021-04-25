import { getTypeSectionSize } from './encoder';
import test from 'ava';
import { NumType, RefType } from './wasm';

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
    10
  );
});
