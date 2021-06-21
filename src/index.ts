import { encodeModule } from './lib/encoder';

export * from './lib/builder';
export * from './lib/leb128';
export { encodeModule };
import * as fs from 'fs';
import { decodeModule } from './lib/decoder';

//@ts-ignore
const wasmCode = fs.readFileSync('examples/example.wasm');
const myModule = decodeModule(wasmCode);
console.log(myModule.code.items[17].code.instructions[5][2].instructions[1]);
fs.writeFileSync('rust_example_out.wasm', encodeModule(myModule));
