## index.cjs

```js

//#region index.ts
const version = "1.0.0";
const buildTime = "2024-01-01";
const isProduction = true;

//#endregion
exports.buildTime = buildTime;
exports.isProduction = isProduction;
exports.version = version;
```

## index.mjs

```js
//#region index.ts
const version = "1.0.0";
const buildTime = "2024-01-01";
const isProduction = true;

//#endregion
export { buildTime, isProduction, version };
```
