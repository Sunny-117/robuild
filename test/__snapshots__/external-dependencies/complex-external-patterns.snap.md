## index.mjs

```js
import { lib1 } from "@company/lib1";
import { lib2 } from "@company/lib2";
import { utils } from "@utils/core";
import { helpers } from "@helpers/main";
import lodash from "lodash";
import axios from "axios";

//#region index.ts
function useCompanyLibs() {
	return lib1.version + lib2.name;
}
function useUtils() {
	return utils.format() + helpers.process();
}
function useThirdParty() {
	return lodash.VERSION + axios.VERSION;
}

//#endregion
export { useCompanyLibs, useThirdParty, useUtils };
```
