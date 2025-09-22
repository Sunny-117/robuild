## browser/index.js

```js
var MathUtils = (function(exports) {


//#region index.ts
function multiply(a, b) {
	return a * b;
}
const PI = 3.14159;

//#endregion
exports.PI = PI;
exports.multiply = multiply;
return exports;
})({});
```
