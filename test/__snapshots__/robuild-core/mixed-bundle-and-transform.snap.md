## index.mjs

```js
//#region src/index.ts
const bundled = "bundled";

//#endregion
export { bundled };
```

## runtime/index.d.mts

```ts
export declare const runtime = "runtime";

```

## runtime/index.mjs

```js
export const runtime = "runtime";

```

## runtime/test.d.mts

```ts
export declare const test: () => string;

```

## runtime/test.mjs

```js
export const test = () => "test";

```
