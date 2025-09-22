## index.mjs

```js
import { internalUtils } from "internal-utils";
import { internalHelpers } from "internal-helpers";
import { externalLib } from "external-lib";

//#region index.ts
function useInternal() {
	return internalUtils.process() + internalHelpers.format();
}
function useExternal() {
	return externalLib.version;
}

//#endregion
export { useExternal, useInternal };
```
