import test from 'ava';
import {getLEB128USize} from "./leb128";

import {
  getFunctionSectionSize,
  getImportSectionSize, getInstructionSize,
  getTypeSectionSize,
} from './size';
import {getRandomInt} from "./utils";

import {
  ExternalKind,
  InstrType,
  NumType,
  OtherInstrType,
  RefType
} from './wasm';

test('getTypeSectionSize', (t) => {
  t.is(
    getTypeSectionSize({
      id: 1,
      items: [
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
      items: [
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
    5,
    getFunctionSectionSize({
      id: 3,
      items: [0, 1, 2, 1],
    })
  );
});

test('getInstructionSize', (t) => {
  const n = getRandomInt(2_147_483_647);

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
  // | [InstrType.Block, BlockType, Expr]
  // | [InstrType.Loop, BlockType, Expr]
  // | [InstrType.If, BlockType, Expr]
  // | [InstrType.If, BlockType, Expr, Expr]
  t.is(getInstructionSize([InstrType.Br, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.BrIf, n]), 1 + getLEB128USize(n));
  // | [InstrType.BrTable, number[], number]
  // | [InstrType.Call, number]
  // | [InstrType.CallIndirect, number, number]
  // | [InstrType.RefNull, RefType]
  // | [InstrType.RefFunc, number]
  // | [InstrType.SelectT, ValueType[]]
  t.is(getInstructionSize([InstrType.LocalGet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.LocalSet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.LocalTee, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.GlobalGet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.GlobalSet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.TableGet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.TableSet, n]), 1 + getLEB128USize(n));
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF32S]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF32U]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF64S]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I32TruncSatF64U]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF32S]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF32U]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF64S]), 2);
  t.is(getInstructionSize([InstrType.Other, OtherInstrType.I64TruncSatF64U]), 2);
  // | [InstrType.Other, OtherInstrType.MemoryInit, number]
  // | [InstrType.Other, OtherInstrType.DataDrop, number]
  // | [InstrType.Other, OtherInstrType.MemoryCopy]
  // | [InstrType.Other, OtherInstrType.MemoryFill]
  // | [InstrType.Other, OtherInstrType.TableInit, number, number]
  // | [InstrType.Other, OtherInstrType.ElemDrop, number]
  // | [InstrType.Other, OtherInstrType.TableCopy, number, number]
  // | [InstrType.Other, OtherInstrType.TableGrow, number]
  // | [InstrType.Other, OtherInstrType.TableSize, number]
  // | [InstrType.Other, OtherInstrType.TableFill, number]
  // | [InstrType.I32Load, number, number]
  // | [InstrType.I64Load, number, number]
  // | [InstrType.F32Load, number, number]
  // | [InstrType.F64Load, number, number]
  // | [InstrType.I32Load8S, number, number]
  // | [InstrType.I32Load8U, number, number]
  // | [InstrType.I32Load16S, number, number]
  // | [InstrType.I32Load16U, number, number]
  // | [InstrType.I64Load8S, number, number]
  // | [InstrType.I64Load8U, number, number]
  // | [InstrType.I64Load16S, number, number]
  // | [InstrType.I64Load16U, number, number]
  // | [InstrType.I64Load32S, number, number]
  // | [InstrType.I64Load32U, number, number]
  // | [InstrType.I32Store, number, number]
  // | [InstrType.I64Store, number, number]
  // | [InstrType.F32Store, number, number]
  // | [InstrType.F64Store, number, number]
  // | [InstrType.I32Store8, number, number]
  // | [InstrType.I32Store16, number, number]
  // | [InstrType.I64Store8, number, number]
  // | [InstrType.I64Store16, number, number]
  // | [InstrType.I64Store32, number, number]
  // | [InstrType.MemorySize]
  // | [InstrType.MemoryGrow]
  // | [InstrType.I32Const, number]
  // | [InstrType.I64Const, number]
  // | [InstrType.F32Const, number]
  // | [InstrType.F64Const, number];
})
