## index.d.mts

```ts
export { add } from "./math.mjs";
```

## index.mjs

```js
export { add } from "./math.mjs";
```

## math.d.mts

```ts
export declare function add(a: number, b: number): number;
```

## math.mjs

```js
export function add(a, b) {
	return a + b;
}
```

## utils/format.d.mts

```ts
export declare function format(value: any): string;
```

## utils/format.mjs

```js
export function format(value) {
	return String(value);
}
```
