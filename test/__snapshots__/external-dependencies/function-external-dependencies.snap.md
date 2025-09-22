## index.mjs

```js
import { customLib } from "custom-package";
import { internalUtil } from "internal-util";
import { externalLib } from "external-lib";

//#region index.ts
function useCustom() {
	return customLib.version;
}
function useInternal() {
	return internalUtil.helper();
}
function useExternal() {
	return externalLib.process();
}

//#endregion
export { useCustom, useExternal, useInternal };
```
