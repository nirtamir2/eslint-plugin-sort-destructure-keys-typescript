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
      description: "basic array of objects with type",
      code: ts`
        const res: Array<{ a: string; b: string }> = [{ b: "2", a: "1" }];
      `,
      output: ts`
        const res: Array<{ a: string; b: string }> = [{ a: "1", b: "2" }];
      `,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "basic array of objects with type and multiple elements",
      code: ts`
        const res: Array<{ a: string; b: string }> = [
          { b: "2", a: "1" },
          { b: "20", a: "10" },
          { a: "100", b: "200" },
        ];
      `,
      output: ts`
        const res: Array<{ a: string; b: string }> = [
          { a: "1", b: "2" },
          { a: "10", b: "20" },
          { a: "100", b: "200" },
        ];
      `,
      errors: [{ messageId: "sort" }, { messageId: "sort" }],
    },
    {
      description:
        "basic array of objects without type (determined by the first element) and multiple elements",
      code: ts`
        const res = [
          { a: "0", b: "0" },
          { b: "2", a: "1" },
          { b: "20", a: "10" },
          { a: "100", b: "200" },
        ];
      `,
      output: ts`
        const res = [
          { a: "0", b: "0" },
          { a: "1", b: "2" },
          { a: "10", b: "20" },
          { a: "100", b: "200" },
        ];
      `,
      errors: [{ messageId: "sort" }, { messageId: "sort" }],
    },
    {
      description: "basic array of nested objects with type",
      code: ts`
        const res: Array<{
          nested: { a: string; b: string };
        }> = [{ nested: { b: "2", a: "1" } }];
      `,
      output: ts`
        const res: Array<{
          nested: { a: string; b: string };
        }> = [{ nested: { a: "1", b: "2" } }];
      `,
      errors: [{ messageId: "sort" }],
    },
  ],
});
