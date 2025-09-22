## index.mjs

```js
import lodash from "lodash";

//#region index.ts
function processData(data) {
	return lodash.map(data, (item) => item.value);
}

//#endregion
export { processData };
```
