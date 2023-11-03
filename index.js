import { readFileSync, writeFileSync } from "fs";
import { promisify } from "util";
import { exec } from "child_process";
import { parse } from "esprima";
import { generate } from "escodegen";

const _exec = promisify(exec);

process.chdir(process.env.FIX_ESLINT_FRONTEND_PATH);

function changeErrorToWarn(node) {
  if (node.type === "Literal" && node.value === "error") {
    node.value = "warn";
    node.raw = "'warn'";
  }
}

function fixEslintrc(ast) {
  const rules = ast.body[0].expression.right.properties.find(
    (it) => it.key.name === "rules"
  );

  for (const { value } of rules.value.properties) {
    if (value.type === "ArrayExpression") {
      changeErrorToWarn(value.elements[0]);
    } else {
      changeErrorToWarn(value);
    }
  }

  return ast;
}

async function main() {
  const { stdout } = await _exec("git ls-files | grep .eslintrc.js");
  const filenames = stdout.split("\n").filter(Boolean);

  for (const f of filenames) {
    console.log(`Fixing ${f}`);

    // hide it from git status, git diff, etc.
    await _exec(`git update-index --assume-unchanged ${f}`);

    // replace errors with warns
    writeFileSync(f, generate(fixEslintrc(parse(readFileSync(f, "utf8")))));
  }
}

main();
