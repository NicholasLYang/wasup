import {
  encodeModule,
  Expr,
  InstrType,
  NumType,
  ValueBlockType,
  ExternalKind, createModule
} from 'wasup';

const module = createModule();
// Declare binarySearch's type signature
// #0 is arr
// #1 is n
// #2 is start
// #3 is end
module.types.items.push({ paramTypes: [NumType.i32, NumType.i32, NumType.i32, NumType.i32], returnTypes: [NumType.i32] });
// Declare binarySearch function
module.functions.items.push(0);
// Declare the memory
module.memories.items.push({ minimum: 1 });
// Declare array as const data
const array = new Uint32Array([-4, -2, 0, 2, 8, 13, 21, 54]);
module.data.items.push({ id: 0, offsetExpr: [[InstrType.I32Const, 0]], bytes: new Uint8Array(array.buffer) });
// Add data count
module.dataCount = { id: 12, dataCount: 1 };
module.exports.items.push({ name: "binarySearch", kind: ExternalKind.Function, index: 0 });

const binarySearchInstructions: Expr = [
  [InstrType.LocalGet, 2],
  [InstrType.LocalGet, 3],
  [InstrType.I32Add],
  [InstrType.I32Const, 2],
  [InstrType.I32DivU],
  [InstrType.LocalTee, 4], // mid = (start + end)/2
  [InstrType.LocalGet, 4],
  [InstrType.LocalGet, 0],
  [InstrType.I32Add],
  [InstrType.I32Const, 4],
  [InstrType.I32Mul],
  [InstrType.I32Load, 0, 0],
  [InstrType.LocalTee, 5], // midElem = arr[mid]
  [InstrType.LocalGet, 1],
  [InstrType.I32Eq], // midElem == n
  [InstrType.BrIf, 0],
  [InstrType.Drop],
  [InstrType.I32Const, -1],
  [InstrType.LocalGet, 4],
  [InstrType.LocalGet, 2],
  [InstrType.I32Eq],
  [InstrType.BrIf, 0],
  [InstrType.Drop],
  [InstrType.LocalGet, 1], // n
  [InstrType.LocalGet, 5], // midElem
  [InstrType.I32GtS],
  [InstrType.If, { valueType: ValueBlockType.i32 }, [
    [InstrType.LocalGet, 0],
    [InstrType.LocalGet, 1],
    [InstrType.LocalGet, 4],
    [
      InstrType.LocalGet,
      3,
    ],
    [InstrType.Call, 0],
  ], [
    [InstrType.LocalGet, 0],
    [InstrType.LocalGet, 1],
    [InstrType.LocalGet, 2],
    [InstrType.LocalGet, 4],
    [InstrType.Call, 0],
  ]]];

module.code.items.push({ locals: [{ count: 2, type: NumType.i32 }], code: binarySearchInstructions });

async function main() {
  const { instance } = await WebAssembly.instantiate(encodeModule(module));

  const { binarySearch } = instance.exports;

  // @ts-ignore
  console.log(binarySearch(0, 8, 0, 7));
}

main();

