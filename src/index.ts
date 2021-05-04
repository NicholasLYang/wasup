import { encodeModule } from './lib/encoder';

export * from './lib/builder';
export * from './lib/leb128';
export { encodeModule };
import * as fs from 'fs';
import { decodeModule } from './lib/decoder';

//@ts-ignore
const myModule = fs.readFileSync('example2.wasm');
console.log(decodeModule(myModule));
