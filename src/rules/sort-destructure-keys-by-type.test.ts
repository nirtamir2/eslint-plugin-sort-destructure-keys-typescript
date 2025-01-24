import { run } from "./_test";
import rule, { RULE_NAME } from "./sort-destructure-keys-by-type";

const interfaceNameEmailUnsorted = `interface Props {
name: string;
email: string;
}

export function Example(props: Props) {
const { email, name } = props;
}`;
const interfaceNameEmailSorted = `interface Props {
name: string;
email: string;
}

export function Example(props: Props) {
const { name, email } = props;
}`;
const interfaceEmailNameUnsorted = `interface Props {
email: string;
name: string;
}

export function Example(props: Props) {
const { name, email } = props;
}`;
const interfaceEmailNameSorted = `interface Props {
email: string;
name: string;
}

export function Example(props: Props) {
const { email, name } = props;
}`;
const typeEmailNameUnsorted = `type Props = {
email: string;
name: string;
}

export function Example(props: Props) {
const { name, email } = props;
}`;
const typeEmailNameSorted = `type Props = {
email: string;
name: string;
}

export function Example(props: Props) {
const { email, name } = props;
}`;
const typeNameEmailUnsorted = `type Props = {
name: string;
email: string;
}

export function Example(props: Props) {
const { email, name } = props;
}`;
const typeNameEmailSorted = `type Props = {
name: string;
email: string;
}

export function Example(props: Props) {
const { name, email } = props;
}`;

const anonymousEmailNameUnsorted = `
export function Example(props: {
email: string;
name: string;
}) {
const { name, email } = props;
}`;
const anonymousEmailNameSorted = `
export function Example(props: {
email: string;
name: string;
}) {
const { email, name } = props;
}`;

const typeIntersectionSorted = `type Props = {
email: string;
name: string;
}

export function Example(props: Props & {a: string}) {
const { email, name, a } = props;
}`;

const typeIntersectionUnsorted = `type Props = {
email: string;
name: string;
}

export function Example(props: Props & {a: string}) {
const { email, a, name } = props;
}`;

const interfaceExtendsSorted = `
type A = {a: string};

interface Props extends A {
email: string;
name: string;
}

export function Example(props: Props) {
const { email, name, a } = props;
}`;

const interfaceExtendsUnsorted = `
type A = {a: string};

interface Props extends A {
email: string;
name: string;
}

export function Example(props: Props) {
const { email, a, name } = props;
}`;
run({
  name: RULE_NAME,
  rule,
  valid: [
    interfaceNameEmailSorted,
    interfaceEmailNameSorted,
    anonymousEmailNameSorted,
    typeEmailNameSorted,
    typeNameEmailSorted,
    {
      code: interfaceNameEmailUnsorted,
      options: [
        {
          typeNameRegex: "^(?!.*Props).*$",
        },
      ],
    },
    {
      code: interfaceNameEmailUnsorted,
      options: [
        {
          typeNameRegex: "NotProps",
        },
      ],
    },
    {
      code: anonymousEmailNameUnsorted,
      options: [
        {
          includeAnonymousType: false,
        },
      ],
    },
    typeIntersectionSorted,
    interfaceExtendsSorted,
  ],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: `${import.meta.dirname}/fixtures`,
  },
  invalid: [
    {
      code: interfaceNameEmailUnsorted,
      output: interfaceNameEmailSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: interfaceEmailNameUnsorted,
      output: interfaceEmailNameSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: anonymousEmailNameUnsorted,
      output: anonymousEmailNameSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: typeEmailNameUnsorted,
      output: typeEmailNameSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: typeNameEmailUnsorted,
      output: typeNameEmailSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: typeIntersectionUnsorted,
      output: typeIntersectionSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: interfaceExtendsUnsorted,
      output: interfaceExtendsSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "nested",
      code: `type Nested = {
  a1: { a21: string; a22: string };
};

export function Example(props: Nested) {
  const {
    a1: { a22, a21 },
  } = props;
}
`,
      output: `type Nested = {
  a1: { a21: string; a22: string };
};

export function Example(props: Nested) {
  const {
    a1: { a21, a22 },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "deep nested",
      code: `type Nested = {
  a1: { a21: { a31: string; a32: string; } };
};

export function Example(props: Nested) {
  const {
    a1: { a21: { a32, a31 } },
  } = props;
}
`,
      output: `type Nested = {
  a1: { a21: { a31: string; a32: string; } };
};

export function Example(props: Nested) {
  const {
    a1: { a21: { a31, a32 } },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "nested integration",
      code: `type Nested = {
    a1: {
        a1b1: { a1b1c1: string; a1b1c2: string };
        a1b2: { a1b2c1: string; a1b2c2: string };
    };
    a2: {
        a2b1: { a2b1c1: string; a2b1c2: string };
        a2b2: { a2b2c1: string; a2b2c2: string };
    };
};

export function Example(props: Nested) {
    const {
        a2: { a2b2, a2b1 },
        a1: { a1b2, a1b1 },
    } = props;
}
`,
      output: `type Nested = {
    a1: {
        a1b1: { a1b1c1: string; a1b1c2: string };
        a1b2: { a1b2c1: string; a1b2c2: string };
    };
    a2: {
        a2b1: { a2b1c1: string; a2b1c2: string };
        a2b2: { a2b2c1: string; a2b2c2: string };
    };
};

export function Example(props: Nested) {
    const {
        a1: { a1b1, a1b2 },
        a2: { a2b1, a2b2 },
    } = props;
}
`,
      errors: [
        { messageId: "sort" },
        { messageId: "sort" },
        { messageId: "sort" },
      ],
    },    {
      description: "nested root order not organized",
      code: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    b1: { b22, b21 },
    a1: { a22, a21 },
  } = props;
}
`,
      output: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    a1: { a21, a22 },
    b1: { b21, b22 },
  } = props;
}
`,
      errors: [
        { messageId: "sort" },
        { messageId: "sort" },
        { messageId: "sort" },
      ],
    },
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
    {
      description: "nested root organized but outer is not organized",
      code: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    b1: { b21, b22 },
    a1: { a21, a22 },
  } = props;
}
`,
      output: `type Nested = {
  a1: { a21: string; a22: string };
  b1: { b21: string; b22: string };
};

export function Example(props: Nested) {
  const {
    a1: { a21, a22 },
    b1: { b21, b22 },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      code: interfaceNameEmailUnsorted,
      output: interfaceNameEmailSorted,
      errors: [{ messageId: "sort" }],
      options: [
        {
          typeNameRegex: "Props",
        },
      ],
    },
    {
      code: anonymousEmailNameUnsorted,
      output: anonymousEmailNameSorted,
      errors: [{ messageId: "sort" }],
      options: [
        {
          includeAnonymousType: true,
        },
      ],
    },
  ],
});
