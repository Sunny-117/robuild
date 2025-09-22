## cjs/index.cjs

```js
Object.defineProperty(exports, '__esModule', { value: true });

//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var multiple_formats_default = "Multi-format test library";

//#endregion
exports.default = multiple_formats_default;
exports.hello = hello;
exports.version = version;
```

## iife/index.js

```js
var TestLib = (function(exports) {

Object.defineProperty(exports, '__esModule', { value: true });

//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var multiple_formats_default = "Multi-format test library";

//#endregion
exports.default = multiple_formats_default;
exports.hello = hello;
exports.version = version;
return exports;
})({});
```

## index.d.mts

```ts
//#region index.d.ts
declare function hello(name: string): string;
declare const version: string;
declare const _default: string;
//#endregion
export { _default as default, hello, version };
```

## index.mjs

```js
//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var multiple_formats_default = "Multi-format test library";

//#endregion
export { multiple_formats_default as default, hello, version };
```
