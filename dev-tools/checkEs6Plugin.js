
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const pluginName = 'CheckEs6Plugin';

class CheckEs6Plugin {
  constructor(options) {

  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(pluginName, (compilation, callback) => {
      for (let [key,value] of Object.entries(compilation.assets)) {
        if (key && key.endsWith('.js')) {
          const content = value.source().toString();
          const ast = babylon.parse (content);
          traverse(ast,{
            enter(path) {
              // check import 
              const _IMPORT = path.node.type === 'ImportDeclaration';
              // check const or let
              const _VARIABLE = path.node.type === 'VariableDeclaration' && (path.node.kind === 'const' || path.node.kind === 'let');
              // check arrow function
              const _STATE = path.node.type === 'ExpressionStatement' && Array.isArray(path.node.arguments) && path.node.arguments[0].type === 'ArrowFunctionExpression';
              if (_IMPORT || _VARIABLE || _STATE) {
                throw new Error('SyntaxError: There is some ES6 syntax in your assets files')
              }
            }
          })
        }
      }
      
      callback();
    });
  }
}

module.exports = CheckEs6Plugin;
