## index.mjs

```js
//#region index.ts
const welcomeMessage = `Welcome to MyApp v2.1.0!`;
const buildInfo = `Built on 2024-01-01 in production mode`;
function getBuildInfo() {
	return `MyApp v2.1.0 (production)`;
}

//#endregion
export { buildInfo, getBuildInfo, welcomeMessage };
```
