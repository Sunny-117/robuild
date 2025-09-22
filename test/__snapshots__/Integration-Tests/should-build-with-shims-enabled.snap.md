## index.mjs

```js
import { createRequire } from "node:module";

//#region rolldown:runtime
var __require = /* @__PURE__ */ createRequire(import.meta.url);

//#endregion
//#region src/index.js
const path = __dirname;
const fs = __require("fs");

//#endregion
export { fs, path };
```
