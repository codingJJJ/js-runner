import type { PluginObj, NodePath } from "@babel/core";
import { thisExpression, identifier } from "@babel/types";

/**
 * 根据作用域生成一个作用域变量名称
 */
function generateBindName(path: NodePath, name = "_this"): string {
  if (!path.scope.hasBinding(name)) {
    return name;
  }
  let number = 0;
  while (true) {
    // 如果作用域含有该函数 则根据累加的number重新生成，直到生成到没有的作用域为止
    let suffixname = name + ++number;
    if (!path.scope.hasBinding(suffixname)) {
      return suffixname;
    }
  }
}
/**
 * 处理箭头函数作用域环境
 */
function hoistFunctionEnvironment(nodePath: NodePath) {
  // 向上寻找的作用域函数，直到顶级为止。
  const thisEnv = nodePath.findParent((p) => {
    return (p.isFunction() && !p.isArrowFunctionExpression) || p.isProgram();
  })!;

  // 新的this名称
  const newThisName = generateBindName(thisEnv);

  // 将当前的声明加入作用域
  thisEnv.scope.push({
    id: identifier(newThisName),
    init: thisExpression(),
  });

  // 替换原有this
  nodePath.traverse({
    ThisExpression(thisPath) {
      const replaceNode = identifier(newThisName);
      thisPath.replaceWith(replaceNode);
    },
  });
}
/**
 * 处理匿名函数
 */
function arrowFunctionExpression(nodePath: NodePath) {
  const { node } = nodePath;
  // 处理作用域环境
  hoistFunctionEnvironment(nodePath);
  // 将函数类型改为FunctionDeclaration
  node.type = "FunctionDeclaration";
}

const arrowFunctionPlugin: PluginObj = {
  visitor: {
    ArrowFunctionExpression: arrowFunctionExpression,
  },
};

export default arrowFunctionPlugin;
