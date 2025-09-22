## index.js

```js
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ?  factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.TestLib = {})));
})(this, function(exports) {
Object.defineProperty(exports, '__esModule', { value: true });

//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var uMD_format_default = "Multi-format test library";

//#endregion
exports.default = uMD_format_default;
exports.hello = hello;
exports.version = version;
});
```
