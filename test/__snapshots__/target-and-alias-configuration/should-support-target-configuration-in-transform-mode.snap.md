## index.d.mts

```ts
export declare const test: unknown;

```

## index.mjs

```js
const _excluded = ["a"];
import _objectWithoutProperties from "@oxc-project/runtime/helpers/objectWithoutProperties";
import _asyncToGenerator from "@oxc-project/runtime/helpers/asyncToGenerator";
export const test = function() {
	var _ref = _asyncToGenerator(function* () {
		const obj = {
			a: 1,
			b: 2
		};
		const { a } = obj, rest = _objectWithoutProperties(obj, _excluded);
		return {
			a,
			rest
		};
	});
	return function test() {
		return _ref.apply(this, arguments);
	};
}();

```
