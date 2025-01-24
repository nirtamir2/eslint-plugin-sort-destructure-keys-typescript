import { run } from "./_test";
import rule, { RULE_NAME } from "./sort-destructure-keys-by-type";

run({
  name: RULE_NAME,
  rule,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: `${import.meta.dirname}/fixtures`,
  },
  invalid: [
    {
      description: "nested only inside not organized",
      code: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    b1: { b21 },
    a1: { a21 },
  } = props;
}
`,
      output: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    a1: { a21 },
    b1: { b21 },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
  ],
});
