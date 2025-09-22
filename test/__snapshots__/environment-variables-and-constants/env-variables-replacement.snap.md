## index.mjs

```js
//#region index.ts
const version = "1.2.3";
const nodeEnv = "production";
const apiUrl = "https://api.example.com";
function getConfig() {
	return {
		version,
		nodeEnv,
		apiUrl
	};
}

//#endregion
export { apiUrl, getConfig, nodeEnv, version };
```
