import { createModule } from './lib/builder';
import { decodeModule } from './lib/decoder';
import { encodeModule } from './lib/encoder';

export * from './lib/leb128';
export * from './lib/wasm';
export { encodeModule, decodeModule, createModule };
