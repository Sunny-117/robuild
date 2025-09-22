## index.cjs

```js

//#region index.ts
function greet(name) {
	return `Hello, ${name}!`;
}

//#endregion
module.exports = greet;
```

## index.d.mts

```ts
//#region index.d.ts
declare function greet(name: string): string;
//#endregion
export { greet as default };
```

## index.mjs

```js
//#region index.ts
function greet(name) {
	return `Hello, ${name}!`;
}

//#endregion
export { greet as default };
```
