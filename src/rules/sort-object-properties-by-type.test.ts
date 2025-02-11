import { any as ts } from "code-tag";
import { run } from "./_test";
import rule, { RULE_NAME } from "./sort-pbject-properties-by-type";

run({
  name: RULE_NAME,
  rule,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: `${import.meta.dirname}/fixtures`,
  },
  valid: [],
  invalid: [
    {
      description: "basic object with type",
      code: ts` const res: { a: string; b: string } = { b: "2", a: "1" }; `,
      output: ts` const res: { a: string; b: string } = { a: "1", b: "2" }; `,
      errors: [{ messageId: "sort" }],
    },
    {
      only: true,
      description: "basic array of objects with type",
      code: ts` const res: Array<{ a: string; b: string }> = [{ b: "2", a: "1" }]; `,
      output: ts` const res: Array<{ a: string; b: string }> = [{ a: "1", b: "2" }]; `,
      errors: [{ messageId: "sort" }],
    },
  ],
});
