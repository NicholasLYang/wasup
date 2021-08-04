import {
  BlockType,
  InstrType,
  Instruction,
  OtherInstrType,
  RefType,
  ValueBlockType,
} from './wasm';

export function printInstrType(instrType: InstrType) {
  const instrTypeToString = {
    [InstrType.Unreachable]: 'unreachable',
    [InstrType.Nop]: 'nop',
    [InstrType.Block]: 'block',
    [InstrType.Loop]: 'loop',
    [InstrType.If]: 'if',
    [InstrType.Else]: 'else',
    [InstrType.Br]: 'br',
    [InstrType.BrIf]: 'br_if',
    [InstrType.BrTable]: 'br_table',
    [InstrType.Return]: 'return',
    [InstrType.Call]: 'call',
    [InstrType.CallIndirect]: 'call_indirect',
    [InstrType.RefNull]: 'ref.null',
    [InstrType.RefIsNull]: 'ref.is_null',
    [InstrType.RefFunc]: 'ref.func',
    [InstrType.Drop]: 'drop',
    [InstrType.Select]: 'select',
    [InstrType.SelectT]: 'select',
    [InstrType.LocalGet]: 'local.get',
    [InstrType.LocalSet]: 'local.set',
    [InstrType.LocalTee]: 'local.tee',
    [InstrType.GlobalGet]: 'global.get',
    [InstrType.GlobalSet]: 'global.set',
    [InstrType.TableGet]: 'table.get',
    [InstrType.TableSet]: 'table.set',
    [InstrType.I32Load]: 'i32.load',
    [InstrType.I64Load]: 'i64.load',
    [InstrType.F32Load]: 'f32.load',
    [InstrType.F64Load]: 'f64.load',
    [InstrType.I32Load8S]: 'i32.load8s',
    [InstrType.I32Load8U]: 'i32.load8u',
    [InstrType.I32Load16S]: 'i32.load16s',
    [InstrType.I32Load16U]: 'i32.load16u',
    [InstrType.I64Load8S]: 'i64.load8s',
    [InstrType.I64Load8U]: 'i64.load8u',
    [InstrType.I64Load16S]: 'i64.load16s',
    [InstrType.I64Load16U]: 'i64.load16u',
    [InstrType.I64Load32S]: 'i64.load32s',
    [InstrType.I64Load32U]: 'i64.load32u',
    [InstrType.I32Store]: 'i32.store',
    [InstrType.I64Store]: 'i64.store',
    [InstrType.F32Store]: 'f32.store',
    [InstrType.F64Store]: 'f64.store',
    [InstrType.I32Store8]: 'i32.store8',
    [InstrType.I32Store16]: 'i32.store16',
    [InstrType.I64Store8]: 'i64.store8',
    [InstrType.I64Store16]: 'i64.store16',
    [InstrType.I64Store32]: 'i64.store32',
    [InstrType.MemorySize]: 'memory.size',
    [InstrType.MemoryGrow]: 'memory.grow',
    [InstrType.I32Const]: 'i32.const',
    [InstrType.I64Const]: 'i64.const',
    [InstrType.F32Const]: 'f32.const',
    [InstrType.F64Const]: 'f64.const',
    [InstrType.I32EqZ]: 'i32.eqz',
    [InstrType.I32Eq]: 'i32.eq',
    [InstrType.I32Ne]: 'i32.ne',
    [InstrType.I32LtS]: 'i32.lt_s',
    [InstrType.I32LtU]: 'i32.lt_u',
    [InstrType.I32GtS]: 'i32.gt_s',
    [InstrType.I32GtU]: 'i32.gt_u',
    [InstrType.I32LeS]: 'i32.le_s',
    [InstrType.I32LeU]: 'i32.le_u',
    [InstrType.I32GeS]: 'i32.ge_s',
    [InstrType.I32GeU]: 'i32.ge_u',
    [InstrType.I64EqZ]: 'i64.eqz',
    [InstrType.I64Eq]: 'i64.eq',
    [InstrType.I64Ne]: 'i64.ne',
    [InstrType.I64LtS]: 'i64.lt_s',
    [InstrType.I64LtU]: 'i64.lt_u',
    [InstrType.I64GtS]: 'i64.gt_s',
    [InstrType.I64GtU]: 'i64.gt_u',
    [InstrType.I64LeS]: 'i64.le_s',
    [InstrType.I64LeU]: 'i64.le_u',
    [InstrType.I64GeS]: 'i64.ge_s',
    [InstrType.I64GeU]: 'i64.ge_u',
    [InstrType.F32Eq]: 'f32.eq',
    [InstrType.F32Ne]: 'f32.ne',
    [InstrType.F32Lt]: 'f32.lt',
    [InstrType.F32Gt]: 'f32.gt',
    [InstrType.F32Le]: 'f32.le',
    [InstrType.F32Ge]: 'f32.ge',
    [InstrType.F64Eq]: 'f64.eq',
    [InstrType.F64Ne]: 'f64.ne',
    [InstrType.F64Lt]: 'f64.lt',
    [InstrType.F64Gt]: 'f64.gt',
    [InstrType.F64Le]: 'f64.le',
    [InstrType.F64Ge]: 'f64.ge',
    [InstrType.I32Clz]: 'i32.clz',
    [InstrType.I32Ctz]: 'i32.ctz',
    [InstrType.I32Popcnt]: 'i32.popcnt',
    [InstrType.I32Add]: 'i32.add',
    [InstrType.I32Sub]: 'i32.sub',
    [InstrType.I32Mul]: 'i32.mul',
    [InstrType.I32DivS]: 'i32.div_s',
    [InstrType.I32DivU]: 'i32.div_u',
    [InstrType.I32RemS]: 'i32.rem_s',
    [InstrType.I32RemU]: 'i32.rem_u',
    [InstrType.I32And]: 'i32.and',
    [InstrType.I32Or]: 'i32.or',
    [InstrType.I32Xor]: 'i32.xor',
    [InstrType.I32Shl]: 'i32.shl',
    [InstrType.I32ShrS]: 'i32.shr_s',
    [InstrType.I32ShrU]: 'i32.shr_u',
    [InstrType.I32Rotl]: 'i32.rotl',
    [InstrType.I32Rotr]: 'i32.rotr',
    [InstrType.I64Clz]: 'i64.clz',
    [InstrType.I64Ctz]: 'i64.ctz',
    [InstrType.I64Popcnt]: 'i64.popcnt',
    [InstrType.I64Add]: 'i64.add',
    [InstrType.I64Sub]: 'i64.sub',
    [InstrType.I64Mul]: 'i64.mul',
    [InstrType.I64DivS]: 'i64.div_s',
    [InstrType.I64DivU]: 'i64.div_u',
    [InstrType.I64RemS]: 'i64.rem_s',
    [InstrType.I64RemU]: 'i64.rem_u',
    [InstrType.I64And]: 'i64.and',
    [InstrType.I64Or]: 'i64.or',
    [InstrType.I64Xor]: 'i64.xor',
    [InstrType.I64Shl]: 'i64.shl',
    [InstrType.I64ShrS]: 'i64.shr_s',
    [InstrType.I64ShrU]: 'i64.shr_u',
    [InstrType.I64Rotl]: 'i64.rotl',
    [InstrType.I64Rotr]: 'i64.rotr',
    [InstrType.F32Abs]: 'f32.abs',
    [InstrType.F32Neg]: 'f32.neg',
    [InstrType.F32Ceil]: 'f32.ceil',
    [InstrType.F32Floor]: 'f32.floor',
    [InstrType.F32Trunc]: 'f32.trunc',
    [InstrType.F32Nearest]: 'f32.nearest',
    [InstrType.F32Sqrt]: 'f32.sqrt',
    [InstrType.F32Add]: 'f32.add',
    [InstrType.F32Sub]: 'f32.sub',
    [InstrType.F32Mul]: 'f32.mul',
    [InstrType.F32Div]: 'f32.div',
    [InstrType.F32Min]: 'f32.min',
    [InstrType.F32Max]: 'f32.max',
    [InstrType.F32CopySign]: 'f32.copysign',
    [InstrType.F64Abs]: 'f64.abs',
    [InstrType.F64Neg]: 'f64.neg',
    [InstrType.F64Ceil]: 'f64.ceil',
    [InstrType.F64Floor]: 'f64.floor',
    [InstrType.F64Trunc]: 'f64.trunc',
    [InstrType.F64Nearest]: 'f64.nearest',
    [InstrType.F64Sqrt]: 'f64.sqrt',
    [InstrType.F64Add]: 'f64.add',
    [InstrType.F64Sub]: 'f64.sub',
    [InstrType.F64Mul]: 'f64.mul',
    [InstrType.F64Div]: 'f64.div',
    [InstrType.F64Min]: 'f64.min',
    [InstrType.F64Max]: 'f64.max',
    [InstrType.F64CopySign]: 'f64.copysign',
    [InstrType.I32WrapI64]: 'i32.wrap_i64',
    [InstrType.I32TruncF32S]: 'i32.trunc_f32_s',
    [InstrType.I32TruncF32U]: 'i32.trunc_f32_u',
    [InstrType.I32TruncF64S]: 'i32.trunc_f64_s',
    [InstrType.I32TruncF64U]: 'i32.trunc_f64_u',
    [InstrType.I64ExtendI32S]: 'i64.extend_i32_s',
    [InstrType.I64ExtendI32U]: 'i64.extend_i32_u',
    [InstrType.I64TruncF32S]: 'i64.trunc_f32_s',
    [InstrType.I64TruncF32U]: 'i64.trunc_f32_u',
    [InstrType.I64TruncF64S]: 'i64.trunc_f64_s',
    [InstrType.I64TruncF64U]: 'i64.trunc_f64_u',
    [InstrType.F32ConvertI32S]: 'f32.convert_i32_s',
    [InstrType.F32ConvertI32U]: 'f32.convert_i32_u',
    [InstrType.F32ConvertI64S]: 'f32.convert_i64_s',
    [InstrType.F32ConvertI64U]: 'f32.convert_i64_u',
    [InstrType.F32DemoteF64]: 'f32.demote_f64',
    [InstrType.F64ConvertI32S]: 'f64.convert_i32_s',
    [InstrType.F64ConvertI32U]: 'f64.convert_i32_u',
    [InstrType.F64ConvertI64S]: 'f64.convert_i64_s',
    [InstrType.F64ConvertI64U]: 'f64.convert_i64_u',
    [InstrType.F64PromoteF32]: 'f64.promote_f32',
    [InstrType.I32ReinterpretF32]: 'i32.reinterpret_f32',
    [InstrType.I64ReinterpretF64]: 'i64.reinterpret_f64',
    [InstrType.F32ReinterpretI32]: 'f32.reinterpret_i32',
    [InstrType.F64ReinterpretI64]: 'f64.reinterpret_i64',
    [InstrType.I32Extend8S]: 'i32.extend8_s',
    [InstrType.I32Extend16S]: 'i32.extend16_s',
    [InstrType.I64Extend8S]: 'i64.extend8_s',
    [InstrType.I64Extend16S]: 'i64.extend16_s',
    [InstrType.I64Extend32S]: 'i64.extend32_s',
    // We handle this in a separate case in printInstruction
    [InstrType.Other]: '',
  };

  return instrTypeToString[instrType];
}

// For some reason WAT has a heap type and a ref type
// which are printed differently
function printHeapType(heapType: RefType): string {
  switch (heapType) {
    case RefType.funcRef:
      return 'funcref';
    case RefType.externRef:
      return 'externref';
  }
}

function printBlockType(blockType: BlockType): string {
  if ('valueType' in blockType) {
    switch (blockType.valueType) {
      case ValueBlockType.i32:
        return '(result i32)';
      case ValueBlockType.i64:
        return '(result i64)';
      case ValueBlockType.f32:
        return '(result f32)';
      case ValueBlockType.f64:
        return '(result f64)';
      case ValueBlockType.AnyFunc:
        return '(result funcref)';
      case ValueBlockType.Empty:
        return '';
    }
  } else if ('typeIndex' in blockType) {
    return `(type ${blockType.typeIndex})`;
  } else {
    throw new Error(`Unreachable`);
  }
}

export function printInstruction(instr: Instruction): string {
  const instrTypeString = printInstrType(instr[0]);

  switch (instr[0]) {
    case InstrType.Unreachable:
    case InstrType.Nop:
    case InstrType.Return:
    case InstrType.RefIsNull:
    case InstrType.Drop:
    case InstrType.Select:
      return instrTypeString;
    case InstrType.Block:
    case InstrType.Loop: {
      return `(${instrTypeString} ${printBlockType(instr[1])} ${instr[2]
        .map(printInstruction)
        .join('\n')}end)`;
    }
    case InstrType.If: {
      const out = `(${instrTypeString} ${printBlockType(
        instr[1]
      )} ${instr[2].map(printInstruction).join('\n')}`;
      if (instr[3]) {
        return `${out} else ${instr[3].map(printInstruction).join('\n')} end)`;
      }
      return `${out} end)`;
    }
    case InstrType.Br:
    case InstrType.BrIf:
    case InstrType.Call:
    case InstrType.RefFunc:
    case InstrType.LocalGet:
    case InstrType.LocalSet:
    case InstrType.LocalTee:
    case InstrType.GlobalGet:
    case InstrType.GlobalSet:
    case InstrType.TableGet:
    case InstrType.TableSet: {
      return `${instrTypeString} ${instr[1]}`;
    }
    case InstrType.Other: {
      switch (instr[1]) {
        case OtherInstrType.I32TruncSatF32S:
          return 'i32.trunc_sat_f32_s';
        case OtherInstrType.I32TruncSatF32U:
          return 'i32.trunc_sat_f32_u';
        case OtherInstrType.I32TruncSatF64S:
          return 'i32.trunc_sat_f64_s';
        case OtherInstrType.I32TruncSatF64U:
          return 'i32.trunc_sat_f64_u';
        case OtherInstrType.I64TruncSatF32S:
          return 'i32.trunc_sat_f32_s';
        case OtherInstrType.I64TruncSatF32U:
          return 'i32.trunc_sat_f32_u';
        case OtherInstrType.I64TruncSatF64S:
          return 'i64.trunc_sat_f64_s';
        case OtherInstrType.I64TruncSatF64U: {
          return 'i64.trunc_sat_f64_u';
        }
        case OtherInstrType.TableInit:
          return 'table.init';
        case OtherInstrType.TableCopy: {
          return 'table.copy';
        }
        case OtherInstrType.ElemDrop:
          return 'elem.drop';
        case OtherInstrType.TableGrow:
          return 'table.grow';
        case OtherInstrType.TableSize:
          return 'table.size';
        case OtherInstrType.TableFill:
          return 'table.fill';
        case OtherInstrType.DataDrop:
          return 'data.drop';
        case OtherInstrType.MemoryCopy:
          return 'memory.copy';
        case OtherInstrType.MemoryFill:
          return 'memory.fill';
        default:
          throw new Error(`Internal: Invalid instruction`);
      }
    }
    case InstrType.I32Load:
    case InstrType.I64Load:
    case InstrType.F32Load:
    case InstrType.F64Load:
    case InstrType.I32Load8S:
    case InstrType.I32Load8U:
    case InstrType.I32Load16S:
    case InstrType.I32Load16U:
    case InstrType.I64Load8S:
    case InstrType.I64Load8U:
    case InstrType.I64Load16S:
    case InstrType.I64Load16U:
    case InstrType.I64Load32S:
    case InstrType.I64Load32U:
    case InstrType.I32Store:
    case InstrType.I64Store:
    case InstrType.F32Store:
    case InstrType.F64Store:
    case InstrType.I32Store8:
    case InstrType.I32Store16:
    case InstrType.I64Store8:
    case InstrType.I64Store16:
    case InstrType.I64Store32:
    case InstrType.CallIndirect: {
      return `${instrTypeString} ${instr[1]} ${instr[2]}`;
    }
    case InstrType.BrTable: {
      return `${instrTypeString} ${instr[1].join(' ')} ${instr[2]}`;
    }
    case InstrType.RefNull: {
      return `${instrTypeString} ${printHeapType(instr[1])}`;
    }
    case InstrType.SelectT: {
      return `${instrTypeString} ${instr[1].join(' ')}`;
    }
    case InstrType.MemorySize:
    case InstrType.MemoryGrow: {
      return instrTypeString;
    }
    case InstrType.I32Const:
    case InstrType.I64Const:
    case InstrType.F32Const:
    case InstrType.F64Const: {
      return `${instrTypeString} ${instr[1]}`;
    }
    default:
      if (instr[0] >= InstrType.I32EqZ && instr[0] <= InstrType.I64Extend32S) {
        return instrTypeString;
      }
      throw new Error(`Unreachable`);
  }
}
