## index.d.mts

```ts
//#region index.d.ts
interface User {
  name: string;
  age: number;
}
declare function greet(user: User): string;
declare const version = "1.0.0";
//#endregion
export { User, greet, version };
```

## index.mjs

```js
//#region index.ts
function greet(user) {
	return `Hello, ${user.name}!`;
}
const version = "1.0.0";

//#endregion
export { greet, version };
```
