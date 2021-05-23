import test from 'ava';
import { createModule } from './builder';
import { InstrType, NumType, RefType } from './wasm';
import { decodeModule } from './decoder';

const emptyModule = createModule();

test('decodeModule', (t) => {
  const localVariables = new Map();
  localVariables.set(NumType.i32, 1);

  t.deepEqual(
    decodeModule(
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
    ),
    {
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
    }
  );

  t.deepEqual(
    decodeModule(
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
    ),
    {
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
    }
  );
});
