## index.mjs

```js
//#region index.ts
const config = {
	api: {
		url: "https://api.prod.com",
		timeout: 3e4,
		retries: 5
	},
	features: {
		debug: false,
		analytics: true
	}
};

//#endregion
export { config };
```
