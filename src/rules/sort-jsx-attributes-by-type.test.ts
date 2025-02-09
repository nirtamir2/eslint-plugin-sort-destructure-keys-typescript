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
      name: "inline type",
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
    {
      name: "with type variable",
      code: `
type Props = { a: string, b: string };
        function A(props: Props) {
}

<A b="2" a="1" />
`,
      output: `
type Props = { a: string, b: string };
        function A(props: Props) {
}

<A a="1" b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with interface",
      code: `
interface Props { a: string, b: string }
        function A(props: Props) {
}

<A b="2" a="1" />
`,
      output: `
interface Props { a: string, b: string }
        function A(props: Props) {
}

<A a="1" b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with unknown props",
      code: `
interface Props { a: string, b: string }
        function A(props: Props) {
}

<A b="2" unknown="s" a="1" />
`,
      output: `
interface Props { a: string, b: string }
        function A(props: Props) {
}

<A a="1" unknown="s" b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with JSXMemberExpression",
      code: `interface Props { a: string, b: string }
function A(props: Props) {
}

const B = { A };

<B.A b="2" a="1" />`,
      output: `interface Props { a: string, b: string }
function A(props: Props) {
}

const B = { A };

<B.A a="1" b="2" />`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with JSXNamespacedName",
      code: `declare namespace JSX {
  interface IntrinsicElements {
    "A:B": { a: string; b: string };
  }
}

<A:B b="2" a="1" />
`,
      output: `declare namespace JSX {
  interface IntrinsicElements {
    "A:B": { a: string; b: string };
  }
}

<A:B a="1" b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with react basic",
      code: `
/// <reference types="react" />
/// <reference types="react-dom" />

import * as React from "react";

<button className="a" type="button" />`,
      output: `
/// <reference types="react" />
/// <reference types="react-dom" />

import * as React from "react";

<button type="button" className="a" />`,

      errors: [{ messageId: "sort" }],
    },
    {
      name: "with react",
      code: `
        /// <reference types="react" />
        /// <reference types="react-dom" />

        import * as React from "react";

interface Props { a: string, b: string }
        function A(props: Props) {
}

<A b="2" a="1" />`,
      output: `
        /// <reference types="react" />
        /// <reference types="react-dom" />

        import * as React from "react";

interface Props { a: string, b: string }
        function A(props: Props) {
}

<A a="1" b="2" />`,

      errors: [{ messageId: "sort" }],
    },
    {
      name: "with spread",
      code: `
interface Props { a: string, b: string, c: string }
        function A(props: Props) {
}

<A b="2" a="1" {...{c: ""}}  />
`,
      output: `
interface Props { a: string, b: string, c: string }
        function A(props: Props) {
}

<A a="1" b="2" {...{c: ""}}  />
`,
      errors: [{ messageId: "sort" }],
    },
    {
      name: "with spread in the middle",
      code: `
interface Props { a: string, b: string, c: string }
        function A(props: Props) {
}

<A b="2" {...{c: ""}} a="1" />
`,
      output: `
interface Props { a: string, b: string, c: string }
        function A(props: Props) {
}

<A a="1" {...{c: ""}} b="2" />
`,
      errors: [{ messageId: "sort" }],
    },
  ],
});
