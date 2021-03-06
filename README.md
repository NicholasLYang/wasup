# wasup

wasup is a library for decoding and encoding the WebAssembly binary format. 
It's zero dependency and entirely written in TypeScript.


## Getting Started

Install with npm or yarn:
```
npm install wasup
yarn add wasup
```

wasup exposes a few functions:

`decodeModule` takes in a buffer containing WebAssembly binary code and decodes it 
into a JavaScript object. This translation is as simple as possible. The module object
contains fields for each section, along with an array of custom sections.

`encodeModule` takes a module object and returns WebAssembly binary code in a buffer.
It does so by figuring out the necessary size for the binary code, allocating the buffer
and encoding the module object. For the most part it assumes the module is valid. As
of right now, wasup does not try to validate the module.

`createModule` creates an empty module object for you to manipulate as you wish.

There's also [API documentation](https://nicholaslyang.github.io/wasup/) and a [binary search example program](https://github.com/NicholasLYang/wasup/tree/master/examples/binary-search).

If you want to know more about the structure of a WebAssembly module, check out the [specification](https://webassembly.github.io/spec/core/), 
the [WASM reference manual](https://github.com/sunfishcode/wasm-reference-manual/blob/master/WebAssembly.md), and 
[this blog post](https://horriblyunderqualified.com/posts/a-mere-mortals-guide-to-webassembly/) written by yours truly.

## Goals

Right now wasup is very bare bones. It provides a way to encode 
a JavaScript representation of a WebAssembly module into a binary representation, 
and it provides a way to decode a binary representation into a JavaScript representation.

In the future, I hope to add support for creating modules and validating them. I'd also like
to add support for proposals like [memory64](https://github.com/WebAssembly/memory64),
[branch hinting](https://github.com/WebAssembly/branch-hinting), etc.

## Inspiration
wasup owes a lot to [walrus](https://github.com/rustwasm/walrus), an excellent library
for manipulating WASM binaries in Rust.
