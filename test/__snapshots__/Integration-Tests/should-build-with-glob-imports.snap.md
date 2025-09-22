## _chunks/Button-C-TnpACQ.mjs

```js
//#region ../../Integration-Tests/should-build-with-glob-imports/src/components/Button.ts
const Button = "button";

//#endregion
export { Button };
```

## _chunks/Input-O2-po6BD.mjs

```js
//#region ../../Integration-Tests/should-build-with-glob-imports/src/components/Input.ts
const Input = "input";

//#endregion
export { Input };
```

## index.mjs

```js
//#region src/index.ts
const modules = {
	"./../../../Integration-Tests/should-build-with-glob-imports/src/components/Input.ts": () => import("./_chunks/Input-O2-po6BD.mjs"),
	"./../../../Integration-Tests/should-build-with-glob-imports/src/components/Button.ts": () => import("./_chunks/Button-C-TnpACQ.mjs")
};

//#endregion
export { modules };
```
