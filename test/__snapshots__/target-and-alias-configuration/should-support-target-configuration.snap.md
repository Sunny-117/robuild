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
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/objectWithoutPropertiesLoose.js
var require_objectWithoutPropertiesLoose = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/objectWithoutPropertiesLoose.js": ((exports, module) => {
	function _objectWithoutPropertiesLoose(r, e) {
		if (null == r) return {};
		var t = {};
		for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
			if (e.includes(n)) continue;
			t[n] = r[n];
		}
		return t;
	}
	module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/objectWithoutProperties.js
var require_objectWithoutProperties = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/objectWithoutProperties.js": ((exports, module) => {
	var objectWithoutPropertiesLoose = require_objectWithoutPropertiesLoose();
	function _objectWithoutProperties$1(e, t) {
		if (null == e) return {};
		var o, r, i = objectWithoutPropertiesLoose(e, t);
		if (Object.getOwnPropertySymbols) {
			var s = Object.getOwnPropertySymbols(e);
			for (r = 0; r < s.length; r++) o = s[r], t.includes(o) || {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
		}
		return i;
	}
	module.exports = _objectWithoutProperties$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

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
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/checkPrivateRedeclaration.js
var require_checkPrivateRedeclaration = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/checkPrivateRedeclaration.js": ((exports, module) => {
	function _checkPrivateRedeclaration(e, t) {
		if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
	}
	module.exports = _checkPrivateRedeclaration, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/classPrivateFieldInitSpec.js
var require_classPrivateFieldInitSpec = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/classPrivateFieldInitSpec.js": ((exports, module) => {
	var checkPrivateRedeclaration = require_checkPrivateRedeclaration();
	function _classPrivateFieldInitSpec$1(e, t, a) {
		checkPrivateRedeclaration(e, t), t.set(e, a);
	}
	module.exports = _classPrivateFieldInitSpec$1, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/assertClassBrand.js
var require_assertClassBrand = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/assertClassBrand.js": ((exports, module) => {
	function _assertClassBrand(e, t, n) {
		if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
		throw new TypeError("Private element is not present on this object");
	}
	module.exports = _assertClassBrand, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region ../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/classPrivateFieldGet2.js
var require_classPrivateFieldGet2 = /* @__PURE__ */ __commonJS({ "../../../../node_modules/.pnpm/@oxc-project+runtime@0.78.0/node_modules/@oxc-project/runtime/src/helpers/classPrivateFieldGet2.js": ((exports, module) => {
	var assertClassBrand = require_assertClassBrand();
	function _classPrivateFieldGet2(s, a) {
		return s.get(assertClassBrand(s, a));
	}
	module.exports = _classPrivateFieldGet2, module.exports.__esModule = true, module.exports["default"] = module.exports;
}) });

//#endregion
//#region index.ts
var import_objectWithoutProperties = /* @__PURE__ */ __toESM(require_objectWithoutProperties(), 1);
var import_asyncToGenerator = /* @__PURE__ */ __toESM(require_asyncToGenerator(), 1);
var import_classPrivateFieldInitSpec = /* @__PURE__ */ __toESM(require_classPrivateFieldInitSpec(), 1);
var import_classPrivateFieldGet2 = /* @__PURE__ */ __toESM(require_classPrivateFieldGet2(), 1);
const _excluded = ["a"];
const test = function() {
	var _ref = (0, import_asyncToGenerator.default)(function* () {
		const obj = {
			a: 1,
			b: 2
		};
		const { a } = obj, rest = (0, import_objectWithoutProperties.default)(obj, _excluded);
		return {
			a,
			rest
		};
	});
	return function test$1() {
		return _ref.apply(this, arguments);
	};
}();
var _private = /* @__PURE__ */ new WeakMap();
var TestClass = class {
	constructor() {
		(0, import_classPrivateFieldInitSpec.default)(this, _private, "private");
	}
	get value() {
		return (0, import_classPrivateFieldGet2.default)(_private, this);
	}
};

//#endregion
export { TestClass, test };
```
