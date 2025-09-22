## index.mjs

```js
import fs from "fs";
import path from "path";
import { browserUtil } from "browser-util";

//#region index.ts
function readFile(filename) {
	return fs.readFileSync(path.join(__dirname, filename), "utf8");
}
function useBrowserUtil() {
	return browserUtil.process();
}

//#endregion
export { readFile, useBrowserUtil };
```
