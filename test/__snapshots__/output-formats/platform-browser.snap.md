## index.js

```js
//#region index.ts
const platform = "browser";
function getPlatform() {
	return typeof window !== "undefined" ? "browser" : "node";
}

//#endregion
export { getPlatform, platform };
```
