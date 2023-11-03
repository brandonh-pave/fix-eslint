import { readFileSync, writeFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { parse } from 'acorn';
import { generate } from 'escodegen';

const _exec = promisify(exec);

function fixEslintConfig(ast) {
  const fixErrorLiteral = (node) => {
    if (node.type === 'Literal' && node.value === 'error') {
      node.value = 'warn';
      node.raw = "'warn'";
    }
  };

  const rules = ast.body[0].expression.right.properties
    .find(it => it.key.name === 'rules');

  for (const { value } of rules.value.properties) {
    if (value.type === 'ArrayExpression') {
      fixErrorLiteral(value.elements[0]);
    } else {
      fixErrorLiteral(value);
    }
  }
}

async function main() {
  process.chdir('/Users/brandonhsiao/frontend');

  const { stdout } = await _exec('ag --hidden -g .eslintrc.js');
  const filenames = stdout.split('\n').filter(Boolean);

  for (const f of filenames) {
    console.log(`fixing ${f}`);

    await _exec(`git update-index --assume-unchanged ${f}`);

    const contents = readFileSync(f, 'utf-8');
    const astNode = parse(contents, { ecmaVersion:  2020 });
    const ast = JSON.parse(JSON.stringify(astNode));

    fixEslintConfig(ast);
    writeFileSync(f, generate(ast));
  }
}

main();
