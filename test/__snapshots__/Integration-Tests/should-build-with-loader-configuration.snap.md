## index.css

```css
export default ".test { color: red; }"

```

## index.mjs

```js
//#region src/data.json
var name = "test";
var version = "1.0.0";
var data_default = {
	name,
	version
};

//#endregion
//#region src/styles.css
var styles_default = {};

//#endregion
//#region src/readme.txt
var readme_default = "export default \"This is a readme file\"";

//#endregion
export { data_default as data, styles_default as styles, readme_default as text };
```
