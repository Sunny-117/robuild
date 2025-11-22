## index.mjs

```js
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

//#region src/index.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const path = __dirname;
const fs = require("fs");

//#endregion
export { fs, path };
```
