## index.d.mts

```ts
//#region index.d.ts
interface User {
  id: number;
  name: string;
  email: string;
}
declare function createUser(name: string, email: string): User;
//#endregion
export { User, createUser };
```

## index.mjs

```js
//#region index.ts
function createUser(name, email) {
	return {
		id: Math.random(),
		name,
		email
	};
}

//#endregion
export { createUser };
```
