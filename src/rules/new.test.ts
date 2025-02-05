import typescriptEslintParser from "@typescript-eslint/parser";
import { run } from "./_test";
import rule, { RULE_NAME } from "./sort-jsx-attributes-by-type";

run({
  name: RULE_NAME,
  rule,
  languageOptions: {
    parser: typescriptEslintParser,
    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: `${import.meta.dirname}/fixtures-jsx`,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  valid: [
    `function Example(props: { a: string; b: string }) {
  return 5;
}

function A() {
  return <Example a="1" b="2" />;
}
`,
  ],
});
