## index.cjs

```js
Object.defineProperty(exports, '__esModule', { value: true });

//#region index.ts
function add(a, b) {
	return a + b;
}
var multiple_formats_default = add;

//#endregion
exports.add = add;
exports.default = multiple_formats_default;
```

## index.d.mts

```ts
//#region index.d.ts
declare function add(a: number, b: number): number;
//#endregion
export { add, add as default };
```

## index.mjs

```js
//#region index.ts
function add(a, b) {
	return a + b;
}
var multiple_formats_default = add;

//#endregion
export { add, multiple_formats_default as default };
```
