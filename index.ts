import { type PluginObj, transform, NodePath } from "@babel/core";
import { thisExpression, identifier } from "@babel/types";

const code = `
var _this = "123";
const arrowFunc = () => {
	console.log(this)
}
`;
function generateBindName(path: NodePath, name = "_this"): string {
  if (!path.scope.hasBinding(name)) {
    return name;
  }
  let number = 0;
  while (true) {
    let suffixname = name + ++number;
    if (!path.scope.hasBinding(suffixname)) {
      return suffixname;
    }
  }
}

function hoistFunctionEnvironment(nodePath: NodePath) {
  const thisEnv = nodePath.findParent((p) => {
    return (p.isFunction() && !p.isArrowFunctionExpression) || p.isProgram();
  })!;

  const newThisName = generateBindName(thisEnv);

  thisEnv.scope.push({
    id: identifier(newThisName),
    init: thisExpression(),
  });

  nodePath.traverse({
    ThisExpression(thisPath) {
      const replaceNode = identifier(newThisName);
      thisPath.replaceWith(replaceNode);
    },
  });
}

function arrowFunctionExpression(nodePath: NodePath) {
  const { node } = nodePath;
  hoistFunctionEnvironment(nodePath);
  node.type = "FunctionDeclaration";
}

const arrowFunctionPlugin: PluginObj = {
  visitor: {
    ArrowFunctionExpression: arrowFunctionExpression,
  },
};

const resCode = transform(code, {
  plugins: [arrowFunctionPlugin],
});
console.log(resCode?.code);
