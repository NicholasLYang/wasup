import { encodeModule } from './lib/encoder';

export * from './lib/builder';
export * from './lib/leb128';
export { encodeModule };
import * as fs from 'fs';
import { decodeModule } from './lib/decoder';

//@ts-ignore
const wasmCode = fs.readFileSync('examples/example3.wasm');
const myModule = decodeModule(wasmCode);
const encodedModule = encodeModule(myModule);
fs.writeFileSync('rust_example_out.wasm', encodedModule);
