## index.mjs

```js
import React from "react";
import ReactDOM from "react-dom";
import Vue from "vue";

//#region index.ts
function createReactApp() {
	return React.createElement("div", null, "Hello React");
}
function renderReact(element) {
	ReactDOM.render(element, document.body);
}
const vueApp = Vue.createApp({});
var AngularComponent = class {
	constructor() {}
};

//#endregion
export { AngularComponent, createReactApp, renderReact, vueApp };
```
