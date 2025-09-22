## index.mjs

```js
import "node:module";

//#region rolldown:runtime
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

//#endregion
//#region src/index.js
var require_src = /* @__PURE__ */ __commonJS({ "src/index.js": ((exports, module) => {
	module.exports = { test: true };
}) });

//#endregion
export default require_src();

```
