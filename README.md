# wasup

wasup is a library for decoding and encoding the WebAssembly binary format. 
It's zero dependency and entirely written in TypeScript.


## Getting Started

Install with npm or yarn:
```
npm install wasup
yarn add wasup
```

wasup exposes three functions: `decodeModule`, `encodeModule`, and `createModule`.

`decodeModule` takes in a buffer containing WebAssembly binary code and decodes it 
into a JavaScript object. This translation is as simple as possible. The module object
contains fields for each section, along with an array of custom sections.

`encodeModule` takes a module object and returns WebAssembly binary code in a buffer.
It does so by figuring out the necessary size for the binary code, allocating the buffer
and encoding the module object. For the most part it assumes the module is valid. As
of right now, wasup does not try to validate the module.

`createModule` creates an empty module object for you to manipulate as you wish.

## Inspiration
wasup owes a lot to [walrus](https://github.com/rustwasm/walrus), an excellent library
for manipulating WASM binaries in Rust.
