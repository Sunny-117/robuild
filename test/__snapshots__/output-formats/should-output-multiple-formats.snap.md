## cjs/index.cjs

```js

//#region index.ts
function add(a, b) {
	return a + b;
}

//#endregion
exports.add = add;
```

## index.mjs

```js
//#region index.ts
function add(a, b) {
	return a + b;
}

//#endregion
export { add };
```
