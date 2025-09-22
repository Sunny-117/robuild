## index.cjs

```js

//#region index.ts
const name = "robuild";
const version = "1.0.0";
function build() {
	console.log("Building...");
}

//#endregion
exports.build = build;
exports.name = name;
exports.version = version;
```

## index.d.mts

```ts
//#region index.d.ts
declare const name: string;
declare const version: string;
declare function build(): void;
//#endregion
export { build, name, version };
```

## index.mjs

```js
//#region index.ts
const name = "robuild";
const version = "1.0.0";
function build() {
	console.log("Building...");
}

//#endregion
export { build, name, version };
```
