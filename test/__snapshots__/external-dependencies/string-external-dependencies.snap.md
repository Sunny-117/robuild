## index.mjs

```js
import lodash from "lodash";
import axios from "axios";

//#region index.ts
function processData(data) {
	return lodash.map(data, (item) => item.value);
}
async function fetchData(url) {
	const response = await axios.get(url);
	return response.data;
}

//#endregion
export { fetchData, processData };
```
