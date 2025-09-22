## index.mjs

```js
import { bundleMePackage } from "bundle-me-package";
import { bundleMeUtils } from "bundle-me-utils";
import { keepExternal } from "keep-external";

//#region index.ts
function useBundled() {
	return bundleMePackage.version + bundleMeUtils.helper();
}
function useExternal() {
	return keepExternal.process();
}

//#endregion
export { useBundled, useExternal };
```
