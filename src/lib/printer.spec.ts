import test from 'ava';

import { printInstruction } from './printer';
import { Expr, InstrType, ValueBlockType } from './wasm';

// These tests are more in case someone accidentally adds a typo
test(
  'printInstruction',
  (t) => {
    t.is(printInstruction([InstrType.Unreachable]), 'unreachable');
    t.is(printInstruction([InstrType.Nop]), 'nop');
    t.is(printInstruction([InstrType.Return]), 'return');
    t.is(printInstruction([InstrType.RefIsNull]), 'ref.is_null');
    t.is(printInstruction([InstrType.Drop]), 'drop');
    t.is(printInstruction([InstrType.Select]), 'select');
    t.is(printInstruction([InstrType.I32EqZ]), 'i32.eqz');
    t.is(printInstruction([InstrType.I32Eq]), 'i32.eq');
    t.is(printInstruction([InstrType.I32Ne]), 'i32.ne');
    t.is(printInstruction([InstrType.I32LtS]), 'i32.lt_s');
    t.is(printInstruction([InstrType.I32LtU]), 'i32.lt_u');
    t.is(printInstruction([InstrType.I32GtS]), 'i32.gt_s');
    t.is(printInstruction([InstrType.I32GtU]), 'i32.gt_u');
    t.is(printInstruction([InstrType.I32LeS]), 'i32.le_s');
    t.is(printInstruction([InstrType.I32LeU]), 'i32.le_u');
    t.is(printInstruction([InstrType.I32GeS]), 'i32.ge_s');
    t.is(printInstruction([InstrType.I32GeU]), 'i32.ge_u');
    t.is(printInstruction([InstrType.I64EqZ]), 'i64.eqz');
    t.is(printInstruction([InstrType.I64Eq]), 'i64.eq');
    t.is(printInstruction([InstrType.I64Ne]), 'i64.ne');
    t.is(printInstruction([InstrType.I64LtS]), 'i64.lt_s');
    t.is(printInstruction([InstrType.I64LtU]), 'i64.lt_u');
    t.is(printInstruction([InstrType.I64GtS]), 'i64.gt_s');
    t.is(printInstruction([InstrType.I64GtU]), 'i64.gt_u');
    t.is(printInstruction([InstrType.I64LeS]), 'i64.le_s');
    t.is(printInstruction([InstrType.I64LeU]), 'i64.le_u');
    t.is(printInstruction([InstrType.I64GeS]), 'i64.ge_s');
    t.is(printInstruction([InstrType.I64GeU]), 'i64.ge_u');
    t.is(printInstruction([InstrType.F32Eq]), 'f32.eq');
    t.is(printInstruction([InstrType.F32Ne]), 'f32.ne');
    t.is(printInstruction([InstrType.F32Lt]), 'f32.lt');
    t.is(printInstruction([InstrType.F32Gt]), 'f32.gt');
    t.is(printInstruction([InstrType.F32Le]), 'f32.le');
    t.is(printInstruction([InstrType.F32Ge]), 'f32.ge');
    t.is(printInstruction([InstrType.F64Eq]), 'f64.eq');
    t.is(printInstruction([InstrType.F64Ne]), 'f64.ne');
    t.is(printInstruction([InstrType.F64Lt]), 'f64.lt');
    t.is(printInstruction([InstrType.F64Gt]), 'f64.gt');
    t.is(printInstruction([InstrType.F64Le]), 'f64.le');
    t.is(printInstruction([InstrType.F64Ge]), 'f64.ge');
    t.is(printInstruction([InstrType.I32Clz]), 'i32.clz');
    t.is(printInstruction([InstrType.I32Ctz]), 'i32.ctz');
    t.is(printInstruction([InstrType.I32Popcnt]), 'i32.popcnt');
    t.is(printInstruction([InstrType.I32Add]), 'i32.add');
    t.is(printInstruction([InstrType.I32Sub]), 'i32.sub');
    t.is(printInstruction([InstrType.I32Mul]), 'i32.mul');
    t.is(printInstruction([InstrType.I32DivS]), 'i32.div_s');
    t.is(printInstruction([InstrType.I32DivU]), 'i32.div_u');
    t.is(printInstruction([InstrType.I32RemS]), 'i32.rem_s');
    t.is(printInstruction([InstrType.I32RemU]), 'i32.rem_u');
    t.is(printInstruction([InstrType.I32And]), 'i32.and');
    t.is(printInstruction([InstrType.I32Or]), 'i32.or');
    t.is(printInstruction([InstrType.I32Xor]), 'i32.xor');
    t.is(printInstruction([InstrType.I32Shl]), 'i32.shl');
    t.is(printInstruction([InstrType.I32ShrS]), 'i32.shr_s');
    t.is(printInstruction([InstrType.I32ShrU]), 'i32.shr_u');
    t.is(printInstruction([InstrType.I32Rotl]), 'i32.rotl');
    t.is(printInstruction([InstrType.I32Rotr]), 'i32.rotr');
    t.is(printInstruction([InstrType.I64Clz]), 'i64.clz');
    t.is(printInstruction([InstrType.I64Ctz]), 'i64.ctz');
    t.is(printInstruction([InstrType.I64Popcnt]), 'i64.popcnt');
    t.is(printInstruction([InstrType.I64Add]), 'i64.add');
    t.is(printInstruction([InstrType.I64Sub]), 'i64.sub');
    t.is(printInstruction([InstrType.I64Mul]), 'i64.mul');
    t.is(printInstruction([InstrType.I64DivS]), 'i64.div_s');
    t.is(printInstruction([InstrType.I64DivU]), 'i64.div_u');
    t.is(printInstruction([InstrType.I64RemS]), 'i64.rem_s');
    t.is(printInstruction([InstrType.I64RemU]), 'i64.rem_u');
    t.is(printInstruction([InstrType.I64And]), 'i64.and');
    t.is(printInstruction([InstrType.I64Or]), 'i64.or');
    t.is(printInstruction([InstrType.I64Xor]), 'i64.xor');
    t.is(printInstruction([InstrType.I64Shl]), 'i64.shl');
    t.is(printInstruction([InstrType.I64ShrS]), 'i64.shr_s');
    t.is(printInstruction([InstrType.I64ShrU]), 'i64.shr_u');
    t.is(printInstruction([InstrType.I64Rotl]), 'i64.rotl');
    t.is(printInstruction([InstrType.I64Rotr]), 'i64.rotr');
    t.is(printInstruction([InstrType.F32Abs]), 'f32.abs');
    t.is(printInstruction([InstrType.F32Neg]), 'f32.neg');
    t.is(printInstruction([InstrType.F32Ceil]), 'f32.ceil');
    t.is(printInstruction([InstrType.F32Floor]), 'f32.floor');
    t.is(printInstruction([InstrType.F32Trunc]), 'f32.trunc');
    t.is(printInstruction([InstrType.F32Nearest]), 'f32.nearest');
    t.is(printInstruction([InstrType.F32Sqrt]), 'f32.sqrt');
    t.is(printInstruction([InstrType.F32Add]), 'f32.add');
    t.is(printInstruction([InstrType.F32Sub]), 'f32.sub');
    t.is(printInstruction([InstrType.F32Mul]), 'f32.mul');
    t.is(printInstruction([InstrType.F32Div]), 'f32.div');
    t.is(printInstruction([InstrType.F32Min]), 'f32.min');
    t.is(printInstruction([InstrType.F32Max]), 'f32.max');
    t.is(printInstruction([InstrType.F32CopySign]), 'f32.copysign');
    t.is(printInstruction([InstrType.F64Abs]), 'f64.abs');
    t.is(printInstruction([InstrType.F64Neg]), 'f64.neg');
    t.is(printInstruction([InstrType.F64Ceil]), 'f64.ceil');
    t.is(printInstruction([InstrType.F64Floor]), 'f64.floor');
    t.is(printInstruction([InstrType.F64Trunc]), 'f64.trunc');
    t.is(printInstruction([InstrType.F64Nearest]), 'f64.nearest');
    t.is(printInstruction([InstrType.F64Sqrt]), 'f64.sqrt');
    t.is(printInstruction([InstrType.F64Add]), 'f64.add');
    t.is(printInstruction([InstrType.F64Sub]), 'f64.sub');
    t.is(printInstruction([InstrType.F64Mul]), 'f64.mul');
    t.is(printInstruction([InstrType.F64Div]), 'f64.div');
    t.is(printInstruction([InstrType.F64Min]), 'f64.min');
    t.is(printInstruction([InstrType.F64Max]), 'f64.max');
    t.is(printInstruction([InstrType.F64CopySign]), 'f64.copysign');
    t.is(printInstruction([InstrType.I32WrapI64]), 'i32.wrap_i64');
    t.is(printInstruction([InstrType.I32TruncF32S]), 'i32.trunc_f32_s');
    t.is(printInstruction([InstrType.I32TruncF32U]), 'i32.trunc_f32_u');
    t.is(printInstruction([InstrType.I32TruncF64S]), 'i32.trunc_f64_s');
    t.is(printInstruction([InstrType.I32TruncF64U]), 'i32.trunc_f64_u');
    t.is(printInstruction([InstrType.I64ExtendI32S]), 'i64.extend_i32_s');
    t.is(printInstruction([InstrType.I64ExtendI32U]), 'i64.extend_i32_u');
    t.is(printInstruction([InstrType.I64TruncF32S]), 'i64.trunc_f32_s');
    t.is(printInstruction([InstrType.I64TruncF32U]), 'i64.trunc_f32_u');
    t.is(printInstruction([InstrType.I64TruncF64S]), 'i64.trunc_f64_s');
    t.is(printInstruction([InstrType.I64TruncF64U]), 'i64.trunc_f64_u');
    t.is(printInstruction([InstrType.F32ConvertI32S]), 'f32.convert_i32_s');
    t.is(printInstruction([InstrType.F32ConvertI32U]), 'f32.convert_i32_u');
    t.is(printInstruction([InstrType.F32ConvertI64S]), 'f32.convert_i64_s');
    t.is(printInstruction([InstrType.F32ConvertI64U]), 'f32.convert_i64_u');
    t.is(printInstruction([InstrType.F32DemoteF64]), 'f32.demote_f64');
    t.is(printInstruction([InstrType.F64ConvertI32S]), 'f64.convert_i32_s');
    t.is(printInstruction([InstrType.F64ConvertI32U]), 'f64.convert_i32_u');
    t.is(printInstruction([InstrType.F64ConvertI64S]), 'f64.convert_i64_s');
    t.is(printInstruction([InstrType.F64ConvertI64U]), 'f64.convert_i64_u');
    t.is(printInstruction([InstrType.F64PromoteF32]), 'f64.promote_f32');
    t.is(
      printInstruction([InstrType.I32ReinterpretF32]),
      'i32.reinterpret_f32',
    );
    t.is(
      printInstruction([InstrType.I64ReinterpretF64]),
      'i64.reinterpret_f64',
    );
    t.is(
      printInstruction([InstrType.F32ReinterpretI32]),
      'f32.reinterpret_i32',
    );
    t.is(
      printInstruction([InstrType.F64ReinterpretI64]),
      'f64.reinterpret_i64',
    );
    t.is(printInstruction([InstrType.I32Extend8S]), 'i32.extend8_s');
    t.is(printInstruction([InstrType.I32Extend16S]), 'i32.extend16_s');
    t.is(printInstruction([InstrType.I64Extend8S]), 'i64.extend8_s');
    t.is(printInstruction([InstrType.I64Extend16S]), 'i64.extend16_s');
    t.is(printInstruction([InstrType.I64Extend32S]), 'i64.extend32_s');
    t.is(
      printInstruction([
        InstrType.Block,
        { valueType: ValueBlockType.f32 },
        [] as Expr,
      ],),
      '(block (result f32) end)',
    );
    t.is(
      printInstruction([
        InstrType.Loop,
        { valueType: ValueBlockType.Empty },
        [],
      ],),
      '(loop  end)',
    );
    t.is(
      printInstruction([InstrType.If, { typeIndex: 0 }, []]),
      '(if (type 0)  end)',
    );
    t.is(
      printInstruction([
        InstrType.If,
        { valueType: ValueBlockType.f64 },
        [],
        [],
      ],),
      '(if (result f64)  else  end)',
    );
    t.is(printInstruction([InstrType.Br, 20]), 'br 20');
    t.is(printInstruction([InstrType.BrIf, 12]), 'br_if 12');
    // t.is(printInstruction([InstrType.BrTable, number[], number]), "");
    // t.is(printInstruction([InstrType.Call, number]), "");
    // t.is(printInstruction([InstrType.CallIndirect, number, number]), "");
    // t.is(printInstruction([InstrType.RefNull, RefType]), "");
    // t.is(printInstruction([InstrType.RefFunc, number]), "");
    // t.is(printInstruction([InstrType.SelectT, ValueType[]]), "");
    // t.is(printInstruction([InstrType.LocalGet, number]), "");
    // t.is(printInstruction([InstrType.LocalSet, number]), "");
    // t.is(printInstruction([InstrType.LocalTee, number]), "");
    // t.is(printInstruction([InstrType.GlobalGet, number]), "");
    // t.is(printInstruction([InstrType.GlobalSet, number]), "");
    // t.is(printInstruction([InstrType.TableGet, number]), "");
    // t.is(printInstruction([InstrType.TableSet, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I32TruncSatF32S]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I32TruncSatF32U]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I32TruncSatF64S]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I32TruncSatF64U]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I64TruncSatF32S]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I64TruncSatF32U]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I64TruncSatF64S]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.I64TruncSatF64U]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.MemoryInit, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.DataDrop, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.MemoryCopy]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.MemoryFill]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.TableInit, number, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.ElemDrop, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.TableCopy, number, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.TableGrow, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.TableSize, number]), "");
    // t.is(printInstruction([InstrType.Other, OtherInstrType.TableFill, number]), "");
    // t.is(printInstruction([InstrType.I32Load, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load, number, number]), "");
    // t.is(printInstruction([InstrType.F32Load, number, number]), "");
    // t.is(printInstruction([InstrType.F64Load, number, number]), "");
    // t.is(printInstruction([InstrType.I32Load8S, number, number]), "");
    // t.is(printInstruction([InstrType.I32Load8U, number, number]), "");
    // t.is(printInstruction([InstrType.I32Load16S, number, number]), "");
    // t.is(printInstruction([InstrType.I32Load16U, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load8S, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load8U, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load16S, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load16U, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load32S, number, number]), "");
    // t.is(printInstruction([InstrType.I64Load32U, number, number]), "");
    // t.is(printInstruction([InstrType.I32Store, number, number]), "");
    // t.is(printInstruction([InstrType.I64Store, number, number]), "");
    // t.is(printInstruction([InstrType.F32Store, number, number]), "");
    // t.is(printInstruction([InstrType.F64Store, number, number]), "");
    // t.is(printInstruction([InstrType.I32Store8, number, number]), "");
    // t.is(printInstruction([InstrType.I32Store16, number, number]), "");
    // t.is(printInstruction([InstrType.I64Store8, number, number]), "");
    // t.is(printInstruction([InstrType.I64Store16, number, number]), "");
    // t.is(printInstruction([InstrType.I64Store32, number, number]), "");
    // t.is(printInstruction([InstrType.MemorySize]), "");
    // t.is(printInstruction([InstrType.MemoryGrow]), "");
    // t.is(printInstruction([InstrType.I32Const, number]), "");
    // t.is(printInstruction([InstrType.I64Const, number]), "");
    // t.is(printInstruction([InstrType.F32Const, number]), "");
    // t.is(printInstruction([InstrType.F64Const, number];), "");
  },
);
