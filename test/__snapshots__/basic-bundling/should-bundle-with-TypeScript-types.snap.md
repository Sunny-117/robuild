## index.d.mts

```ts
//#region index.d.ts
interface User {
  name: string;
  age: number;
}
declare function greet(user: User): string;
//#endregion
export { User, greet };
```

## index.mjs

```js
//#region index.ts
function greet(user) {
	return `Hello, ${user.name}!`;
}

//#endregion
export { greet };
```
