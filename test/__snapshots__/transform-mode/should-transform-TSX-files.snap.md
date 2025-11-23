## Button.d.mts

```ts
export interface ButtonProps {
	label: string;
	onClick: () => void;
}
export default function Button(props: ButtonProps);
```

## Button.mjs

```js
import { jsx as _jsx } from "react/jsx-runtime";
export default function Button(props) {
	return /* @__PURE__ */ _jsx("button", {
		onClick: props.onClick,
		children: props.label
	});
}
```

## index.d.mts

```ts
export { default as Button } from "./Button.mjs";
```

## index.mjs

```js
export { default as Button } from "./Button.mjs";
```
