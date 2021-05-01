import { encodeModule } from './lib/encoder';
import { NumType, RefType } from './lib/wasm';
// @ts-ignore
import * as fs from 'fs';

export * from './lib/leb128';

const localVariables = new Map();
localVariables.set(NumType.i32, 1);

const encodedModule = encodeModule({
  types: {
    id: 1,
    types: [{ paramTypes: [NumType.i32], returnTypes: [NumType.i32] }],
  },
  functions: {
    id: 3,
    functionTypes: [0],
  },
  code: {
    id: 10,
    code: [{ locals: localVariables, code: [0x20, 0, 0x41, 2, 0x6c] }],
  },
  customSections: [],
});

const byteArray = new Uint8Array(encodedModule.length);
for (let i = 0; i < encodedModule.length; i++) {
  byteArray[i] = encodedModule[i];
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
fs.writeFileSync('output.wasm', byteArray);
