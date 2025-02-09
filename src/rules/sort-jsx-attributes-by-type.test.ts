import typescriptEslintParser from "@typescript-eslint/parser";
import { run } from "./_test";
import rule, { RULE_NAME } from "./sort-jsx-attributes-by-type";

run({
  name: RULE_NAME,
  rule,
  languageOptions: {
    parser: typescriptEslintParser,
    parserOptions: {
      projectService: true,
      project: "./tsconfig.json",
      tsconfigRootDir: `${import.meta.dirname}/fixtures-jsx`,
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
  valid: [
    `
        function A(props: { a: string, b: string }) {
}

<A a="1" b="2" />
`,
  ],
  invalid: [
    {
      code: `
        function A(props: { a: string, b: string }) {
}

<A b="2" a="1" />
`,
      output: `
        function A(props: { a: string, b: string }) {
}

<A a="1" b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
  ],
});
