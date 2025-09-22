## index.mjs

```js
import { shouldBundle } from "should-bundle";
import { shouldStayExternal } from "should-stay-external";

//#region index.ts
function useBundled() {
	return shouldBundle.value;
}
function useExternal() {
	return shouldStayExternal.value;
}

//#endregion
export { useBundled, useExternal };
```
