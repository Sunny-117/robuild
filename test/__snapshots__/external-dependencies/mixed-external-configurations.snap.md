## index.mjs

```js
import lodash from "lodash";
import { customExternal } from "custom-external-lib";
import { forceBundled } from "force-bundled";

//#region index.ts
function processWithLodash(data) {
	return lodash.map(data, (x) => x);
}
function useCustom() {
	return customExternal.version;
}
function useBundled() {
	return forceBundled.helper();
}

//#endregion
export { processWithLodash, useBundled, useCustom };
```
