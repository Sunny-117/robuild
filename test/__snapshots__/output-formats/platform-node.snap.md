## index.mjs

```js
//#region index.ts
const platform = "node";
function getPlatform() {
	return typeof process !== "undefined" ? "node" : "browser";
}

//#endregion
export { getPlatform, platform };
```
