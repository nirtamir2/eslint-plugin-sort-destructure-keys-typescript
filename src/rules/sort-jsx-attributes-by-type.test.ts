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
  valid: [],
  invalid: [
    {
      code: `
        function A(props: { a: string, b: string }) {
}

<A b="" a="" />
`,
      errors: [{ messageId: "sort" }],
    },
  ],
});
