## index.mjs

```js
import "node:module";

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/asyncToGenerator.js
var require_asyncToGenerator = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/asyncToGenerator.js": ((exports, module) => {
	function asyncGeneratorStep(n, t, e, r, o, a, c) {
		try {
			var i = n[a](c), u = i.value;
		} catch (n$1) {
			return void e(n$1);
		}
		i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator$1(n) {
		return function() {
			var t = this, e = arguments;
			return new Promise(function(r, o) {
				var a = n.apply(t, e);
				function _next(n$1) {
					asyncGeneratorStep(a, r, o, _next, _throw, "next", n$1);
				}
				function _throw(n$1) {
					asyncGeneratorStep(a, r, o, _next, _throw, "throw", n$1);
				}
				_next(void 0);
			});
		};
	}
	module.exports = _asyncToGenerator$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region index.ts
var import_asyncToGenerator = /* @__PURE__ */ __toESM(require_asyncToGenerator(), 1);
function fetchData() {
	return _fetchData.apply(this, arguments);
}
function _fetchData() {
	_fetchData = (0, import_asyncToGenerator.default)(function* () {
		const response = yield fetch("https://api.example.com/data");
		return response.json();
	});
	return _fetchData.apply(this, arguments);
}
const asyncArrow = function() {
	var _ref = (0, import_asyncToGenerator.default)(function* () {
		yield Promise.resolve();
		return "done";
	});
	return function asyncArrow$1() {
		return _ref.apply(this, arguments);
	};
}();

//#endregion
export { asyncArrow, fetchData };
```
