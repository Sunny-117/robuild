## index.mjs

```js
//#region index.ts
const isDev = false;
const buildMode = "production";
const debugLevel = 0;
const featureFlag = true;
function getConstants() {
	return {
		isDev,
		buildMode,
		debugLevel,
		featureFlag
	};
}

//#endregion
export { buildMode, debugLevel, featureFlag, getConstants, isDev };
```
