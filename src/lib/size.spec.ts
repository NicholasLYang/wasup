import test from 'ava';

import { getLEB128SSize, getLEB128USize } from './leb128';
import {
  getFunctionSectionSize,
  getImportSectionSize,
  getInstructionSize,
  getTypeSectionSize,
} from './size';
import { getRandomInt } from './utils';
import {
  ExternalKind,
  InstrType,
  NumType,
  OtherInstrType,
  RefType,
  ValueBlockType,
} from './wasm';

test(
  'getTypeSectionSize',
  (t) => {
    t.is(
      getTypeSectionSize({
        id: 1,
        items: [
          {
            paramTypes: [NumType.i32, NumType.f32],
            returnTypes: [RefType.funcRef, NumType.i64],
          },
        ],
      },),
      8,
    );
  },
);

test(
  'getImportSectionSize',
  (t) => {
    t.is(
      getImportSectionSize({
        id: 2,
        items: [
          {
            module: 'std',
            field: 'alloc',
            description: { kind: ExternalKind.Function, typeIndex: 0 },
          },
        ],
      },),
      13,
    );
  },
);

test(
  'getFunctionSectionSize',
  (t) => {
    t.is(
      5,
      getFunctionSectionSize({
        id: 3,
        items: [0, 1, 2, 1],
      },),
    );
  },
);

test(
  'getInstructionSize',
  (t) => {
    const n = getRandomInt(2_147_483_647);
    const m = getRandomInt(2_147_483_647);

    t.is(getInstructionSize([InstrType.Unreachable]), 1);
    t.is(getInstructionSize([InstrType.Nop]), 1);
    t.is(getInstructionSize([InstrType.Return]), 1);
    t.is(getInstructionSize([InstrType.RefIsNull]), 1);
    t.is(getInstructionSize([InstrType.Drop]), 1);
    t.is(getInstructionSize([InstrType.Select]), 1);
    t.is(getInstructionSize([InstrType.I32EqZ]), 1);
    t.is(getInstructionSize([InstrType.I32Eq]), 1);
    t.is(getInstructionSize([InstrType.I32Ne]), 1);
    t.is(getInstructionSize([InstrType.I32LtS]), 1);
    t.is(getInstructionSize([InstrType.I32LtU]), 1);
    t.is(getInstructionSize([InstrType.I32GtS]), 1);
    t.is(getInstructionSize([InstrType.I32GtU]), 1);
    t.is(getInstructionSize([InstrType.I32LeS]), 1);
    t.is(getInstructionSize([InstrType.I32LeU]), 1);
    t.is(getInstructionSize([InstrType.I32GeS]), 1);
    t.is(getInstructionSize([InstrType.I32GeU]), 1);
    t.is(getInstructionSize([InstrType.I64EqZ]), 1);
    t.is(getInstructionSize([InstrType.I64Eq]), 1);
    t.is(getInstructionSize([InstrType.I64Ne]), 1);
    t.is(getInstructionSize([InstrType.I64LtS]), 1);
    t.is(getInstructionSize([InstrType.I64LtU]), 1);
    t.is(getInstructionSize([InstrType.I64GtS]), 1);
    t.is(getInstructionSize([InstrType.I64GtU]), 1);
    t.is(getInstructionSize([InstrType.I64LeS]), 1);
    t.is(getInstructionSize([InstrType.I64LeU]), 1);
    t.is(getInstructionSize([InstrType.I64GeS]), 1);
    t.is(getInstructionSize([InstrType.I64GeU]), 1);
    t.is(getInstructionSize([InstrType.F32Eq]), 1);
    t.is(getInstructionSize([InstrType.F32Ne]), 1);
    t.is(getInstructionSize([InstrType.F32Lt]), 1);
    t.is(getInstructionSize([InstrType.F32Gt]), 1);
    t.is(getInstructionSize([InstrType.F32Le]), 1);
    t.is(getInstructionSize([InstrType.F32Ge]), 1);
    t.is(getInstructionSize([InstrType.F64Eq]), 1);
    t.is(getInstructionSize([InstrType.F64Ne]), 1);
    t.is(getInstructionSize([InstrType.F64Lt]), 1);
    t.is(getInstructionSize([InstrType.F64Gt]), 1);
    t.is(getInstructionSize([InstrType.F64Le]), 1);
    t.is(getInstructionSize([InstrType.F64Ge]), 1);
    t.is(getInstructionSize([InstrType.I32Clz]), 1);
    t.is(getInstructionSize([InstrType.I32Ctz]), 1);
    t.is(getInstructionSize([InstrType.I32Popcnt]), 1);
    t.is(getInstructionSize([InstrType.I32Add]), 1);
    t.is(getInstructionSize([InstrType.I32Sub]), 1);
    t.is(getInstructionSize([InstrType.I32Mul]), 1);
    t.is(getInstructionSize([InstrType.I32DivS]), 1);
    t.is(getInstructionSize([InstrType.I32DivU]), 1);
    t.is(getInstructionSize([InstrType.I32RemS]), 1);
    t.is(getInstructionSize([InstrType.I32RemU]), 1);
    t.is(getInstructionSize([InstrType.I32And]), 1);
    t.is(getInstructionSize([InstrType.I32Or]), 1);
    t.is(getInstructionSize([InstrType.I32Xor]), 1);
    t.is(getInstructionSize([InstrType.I32Shl]), 1);
    t.is(getInstructionSize([InstrType.I32ShrS]), 1);
    t.is(getInstructionSize([InstrType.I32ShrU]), 1);
    t.is(getInstructionSize([InstrType.I32Rotl]), 1);
    t.is(getInstructionSize([InstrType.I32Rotr]), 1);
    t.is(getInstructionSize([InstrType.I64Clz]), 1);
    t.is(getInstructionSize([InstrType.I64Ctz]), 1);
    t.is(getInstructionSize([InstrType.I64Popcnt]), 1);
    t.is(getInstructionSize([InstrType.I64Add]), 1);
    t.is(getInstructionSize([InstrType.I64Sub]), 1);
    t.is(getInstructionSize([InstrType.I64Mul]), 1);
    t.is(getInstructionSize([InstrType.I64DivS]), 1);
    t.is(getInstructionSize([InstrType.I64DivU]), 1);
    t.is(getInstructionSize([InstrType.I64RemS]), 1);
    t.is(getInstructionSize([InstrType.I64RemU]), 1);
    t.is(getInstructionSize([InstrType.I64And]), 1);
    t.is(getInstructionSize([InstrType.I64Or]), 1);
    t.is(getInstructionSize([InstrType.I64Xor]), 1);
    t.is(getInstructionSize([InstrType.I64Shl]), 1);
    t.is(getInstructionSize([InstrType.I64ShrS]), 1);
    t.is(getInstructionSize([InstrType.I64ShrU]), 1);
    t.is(getInstructionSize([InstrType.I64Rotl]), 1);
    t.is(getInstructionSize([InstrType.I64Rotr]), 1);
    t.is(getInstructionSize([InstrType.F32Abs]), 1);
    t.is(getInstructionSize([InstrType.F32Neg]), 1);
    t.is(getInstructionSize([InstrType.F32Ceil]), 1);
    t.is(getInstructionSize([InstrType.F32Floor]), 1);
    t.is(getInstructionSize([InstrType.F32Trunc]), 1);
    t.is(getInstructionSize([InstrType.F32Nearest]), 1);
    t.is(getInstructionSize([InstrType.F32Sqrt]), 1);
    t.is(getInstructionSize([InstrType.F32Add]), 1);
    t.is(getInstructionSize([InstrType.F32Sub]), 1);
    t.is(getInstructionSize([InstrType.F32Mul]), 1);
    t.is(getInstructionSize([InstrType.F32Div]), 1);
    t.is(getInstructionSize([InstrType.F32Min]), 1);
    t.is(getInstructionSize([InstrType.F32Max]), 1);
    t.is(getInstructionSize([InstrType.F32CopySign]), 1);
    t.is(getInstructionSize([InstrType.F64Abs]), 1);
    t.is(getInstructionSize([InstrType.F64Neg]), 1);
    t.is(getInstructionSize([InstrType.F64Ceil]), 1);
    t.is(getInstructionSize([InstrType.F64Floor]), 1);
    t.is(getInstructionSize([InstrType.F64Trunc]), 1);
    t.is(getInstructionSize([InstrType.F64Nearest]), 1);
    t.is(getInstructionSize([InstrType.F64Sqrt]), 1);
    t.is(getInstructionSize([InstrType.F64Add]), 1);
    t.is(getInstructionSize([InstrType.F64Sub]), 1);
    t.is(getInstructionSize([InstrType.F64Mul]), 1);
    t.is(getInstructionSize([InstrType.F64Div]), 1);
    t.is(getInstructionSize([InstrType.F64Min]), 1);
    t.is(getInstructionSize([InstrType.F64Max]), 1);
    t.is(getInstructionSize([InstrType.F64CopySign]), 1);
    t.is(getInstructionSize([InstrType.I32WrapI64]), 1);
    t.is(getInstructionSize([InstrType.I32TruncF32S]), 1);
    t.is(getInstructionSize([InstrType.I32TruncF32U]), 1);
    t.is(getInstructionSize([InstrType.I32TruncF64S]), 1);
    t.is(getInstructionSize([InstrType.I32TruncF64U]), 1);
    t.is(getInstructionSize([InstrType.I64ExtendI32S]), 1);
    t.is(getInstructionSize([InstrType.I64ExtendI32U]), 1);
    t.is(getInstructionSize([InstrType.I64TruncF32S]), 1);
    t.is(getInstructionSize([InstrType.I64TruncF32U]), 1);
    t.is(getInstructionSize([InstrType.I64TruncF64S]), 1);
    t.is(getInstructionSize([InstrType.I64TruncF64U]), 1);
    t.is(getInstructionSize([InstrType.F32ConvertI32S]), 1);
    t.is(getInstructionSize([InstrType.F32ConvertI32U]), 1);
    t.is(getInstructionSize([InstrType.F32ConvertI64S]), 1);
    t.is(getInstructionSize([InstrType.F32ConvertI64U]), 1);
    t.is(getInstructionSize([InstrType.F32DemoteF64]), 1);
    t.is(getInstructionSize([InstrType.F64ConvertI32S]), 1);
    t.is(getInstructionSize([InstrType.F64ConvertI32U]), 1);
    t.is(getInstructionSize([InstrType.F64ConvertI64S]), 1);
    t.is(getInstructionSize([InstrType.F64ConvertI64U]), 1);
    t.is(getInstructionSize([InstrType.F64PromoteF32]), 1);
    t.is(getInstructionSize([InstrType.I32ReinterpretF32]), 1);
    t.is(getInstructionSize([InstrType.I64ReinterpretF64]), 1);
    t.is(getInstructionSize([InstrType.F32ReinterpretI32]), 1);
    t.is(getInstructionSize([InstrType.F64ReinterpretI64]), 1);
    t.is(getInstructionSize([InstrType.I32Extend8S]), 1);
    t.is(getInstructionSize([InstrType.I32Extend16S]), 1);
    t.is(getInstructionSize([InstrType.I64Extend8S]), 1);
    t.is(getInstructionSize([InstrType.I64Extend16S]), 1);
    t.is(getInstructionSize([InstrType.I64Extend32S]), 1);
    t.is(
      getInstructionSize([
        InstrType.Block,
        { valueType: ValueBlockType.i32 },
        [],
      ],),
      3,
    );
    t.is(
      getInstructionSize([InstrType.Loop, { typeIndex: n }, []]),
      2 + getLEB128SSize(n),
    );
    t.is(
      getInstructionSize([InstrType.If, { valueType: ValueBlockType.f64 }, []]),
      3,
    );
    t.is(
      getInstructionSize([
        InstrType.If,
        { valueType: ValueBlockType.i32 },
        [],
        [],
      ],),
      4,
    );
    t.is(getInstructionSize([InstrType.Br, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.BrIf, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.BrTable, [], n]), 2 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.Call, n]), 1 + getLEB128USize(n));
    t.is(
      getInstructionSize([InstrType.CallIndirect, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(getInstructionSize([InstrType.RefNull, RefType.funcRef]), 2);
    t.is(getInstructionSize([InstrType.RefFunc, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.SelectT, []]), 2);
    t.is(getInstructionSize([InstrType.LocalGet, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.LocalSet, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.LocalTee, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.GlobalGet, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.GlobalSet, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.TableGet, n]), 1 + getLEB128USize(n));
    t.is(getInstructionSize([InstrType.TableSet, n]), 1 + getLEB128USize(n));
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF32S]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF32U]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF64S]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF64U]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF32S]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF32U]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF64S]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF64U]),
      2,
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.MemoryInit, n]),
      3 + getLEB128USize(n),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.DataDrop, n]),
      2 + getLEB128USize(n),
    );
    t.is(getInstructionSize([InstrType.Other, OtherInstrType.MemoryCopy]), 4);
    t.is(getInstructionSize([InstrType.Other, OtherInstrType.MemoryFill]), 3);
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.TableInit, n, m]),
      2 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.ElemDrop, n]),
      2 + getLEB128USize(n),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.TableCopy, n, m]),
      2 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.TableGrow, n]),
      2 + getLEB128USize(n),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.TableSize, n]),
      2 + getLEB128USize(n),
    );
    t.is(
      getInstructionSize([InstrType.Other, OtherInstrType.TableFill, n]),
      2 + getLEB128USize(n),
    );
    t.is(
      getInstructionSize([InstrType.I32Load, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.F32Load, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.F64Load, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Load8S, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Load8U, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Load16S, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Load16U, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load8S, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load8U, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load16S, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load16U, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load32S, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Load32U, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Store, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Store, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.F32Store, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.F64Store, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Store8, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I32Store16, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Store8, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Store16, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(
      getInstructionSize([InstrType.I64Store32, n, m]),
      1 + getLEB128USize(n) + getLEB128USize(m),
    );
    t.is(getInstructionSize([InstrType.MemorySize]), 2);
    t.is(getInstructionSize([InstrType.MemoryGrow]), 2);
    t.is(getInstructionSize([InstrType.I32Const, n]), 1 + getLEB128SSize(n));
    t.is(getInstructionSize([InstrType.I64Const, n]), 1 + getLEB128SSize(n));
    t.is(getInstructionSize([InstrType.F32Const, n]), 5);
    t.is(getInstructionSize([InstrType.F64Const, n]), 9);
  },
);
