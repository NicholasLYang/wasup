import {createModule} from "./lib/builder";
import {
  createEncoder, encodeCodeSection,
  encodeModule
} from './lib/encoder';

export * from './lib/builder';
export * from './lib/leb128';
export { encodeModule };
import * as fs from 'fs';
import { decodeModule } from './lib/decoder';
import {getCodeSize} from "./lib/size";

//@ts-ignore
const wasmCode = fs.readFileSync('examples/example.wasm');
const myModule = decodeModule(wasmCode);
for (const code of myModule.code.items) {
  console.log(`LENGTH: ${getCodeSize(code)}`);
}
const encoder = createEncoder({ ...createModule(), code: myModule.code });
encodeCodeSection(encoder, myModule.code);
const encodedModule = encodeModule(myModule);
fs.writeFileSync('rust_example_out.wasm', encodedModule);
console.log(decodeModule(encodedModule));
