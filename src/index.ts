import { addFunction, createModule } from './lib/builder';
import { decodeModule } from './lib/decoder';
import { encodeModule } from './lib/encoder';
import { NumType } from './lib/wasm';

export * from './lib/builder';
export * from './lib/leb128';
export { encodeModule };

const myModule = createModule();

addFunction(myModule, {
  name: 'foo',
  type: { paramTypes: [NumType.i32], returnTypes: [NumType.i32] },
  code: [0x41, 2],
  locals: new Map(),
});

const encodedModule = encodeModule(myModule);

decodeModule(encodedModule);
