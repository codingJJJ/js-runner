import { transform } from "@babel/core";
import arrowFunctionPlugin from "./src/template/arrowFunction-plugin";

const code = `
var _this = "123";
const arrowFunc = () => {
	console.log(this)
}
`;

const resCode = transform(code, {
  plugins: [arrowFunctionPlugin],
});
console.log(resCode?.code);
