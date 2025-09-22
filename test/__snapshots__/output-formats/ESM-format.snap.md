## index.d.mts

```ts
//#region index.d.ts
declare function hello(name: string): string;
declare const version: string;
declare const _default: string;
//#endregion
export { _default as default, hello, version };
```

## index.mjs

```js
//#region index.ts
function hello(name) {
	return `Hello, ${name}!`;
}
const version = "1.0.0";
var eSM_format_default = "Multi-format test library";

//#endregion
export { eSM_format_default as default, hello, version };
```
