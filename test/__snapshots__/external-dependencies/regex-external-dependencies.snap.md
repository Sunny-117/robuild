## index.mjs

```js
import { utils } from "@internal/utils";

//#region index.ts
function handler(req) {
	console.log("Handling request");
}
const config = { port: 3e3 };

//#endregion
export { config, handler, utils };
```
