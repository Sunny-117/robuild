## browser/index.js

```js
var TestLib = (function(exports) {

Object.defineProperty(exports, '__esModule', { value: true });

//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var iIFE_format_default = "Multi-format test library";

//#endregion
exports.default = iIFE_format_default;
exports.hello = hello;
exports.version = version;
return exports;
})({});
```
