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

const interfaceNameEmailWithDefaultValueUnsorted = `interface Props {
name: string;
email: string;
}

export function Example(props: Props) {
const { email = "defaultEmail", name } = props;
}`;

const interfaceNameEmailWithDefaultValueSorted = `interface Props {
name: string;
email: string;
}

export function Example(props: Props) {
const { name, email = "defaultEmail" } = props;
}`;

run({
  name: RULE_NAME,
  rule,
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: `${import.meta.dirname}/fixtures`,
  },
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
  invalid: [
    {
      code: interfaceNameEmailUnsorted,
      output: interfaceNameEmailSorted,
      errors: [{ messageId: "sort" }],
    },
    {
      code: interfaceNameEmailWithDefaultValueUnsorted,
      output: interfaceNameEmailWithDefaultValueSorted,
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
      only: true,
      description: "nested object destructuring with default values",
      code: `
interface Level3 {
  a: string;
  b: string;
}

interface Level2 {
  level3: Level3;
  a: string;
  b: string;
}

interface Level1 {
  level2: Level2;
  a: string;
  b: string;
}

export function Example_3(level1: Level1): void {
  const {
    level2: {
      level3: { b, a },
    } = {},
  } = level1;
}
`,
      output: `
interface Level3 {
  a: string;
  b: string;
}

interface Level2 {
  level3: Level3;
  a: string;
  b: string;
}

interface Level1 {
  level2: Level2;
  a: string;
  b: string;
}

export function Example_3(level1: Level1): void {
  const {
    level2: {
      level3: { a, b },
    } = {},
  } = level1;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description:
        "nested object destructuring with default value for parent complex",
      code: `type Nested = {
  a: string;
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    parent: { secondChild, firstChild } = { secondChild: '', firstChild: '' },
    a
  } = props;
}
`,
      output: `type Nested = {
  a: string;
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    a,
    parent: { firstChild, secondChild } = { secondChild: '', firstChild: '' }
  } = props;
}
`,
      errors: [{ messageId: "sort" }, { messageId: "sort" }],
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
      description: "nested object destructuring",
      code: `type Nested = {
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    parent: { secondChild, firstChild },
  } = props;
}
`,
      output: `type Nested = {
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    parent: { firstChild, secondChild },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "nested object destructuring with default value",
      code: `type Nested = {
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    parent: { secondChild = "default", firstChild },
  } = props;
}
`,
      output: `type Nested = {
  parent: { firstChild: string; secondChild: string };
};

export function Example(props: Nested) {
  const {
    parent: { firstChild, secondChild = "default" },
  } = props;
}
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "nested object destructuring with optional type",
      code: `type Nested = { firstChild: string; secondChild: string };

export function Example(props: {name?: Nested, email:string }) {
  const {
    name: { secondChild, firstChild },
    email
  } = props;
}
`,
      output: `type Nested = { firstChild: string; secondChild: string };

export function Example(props: {name?: Nested, email:string }) {
  const {
    name: { firstChild, secondChild },
    email
  } = props;
}
`,

      errors: [{ messageId: "sort" }],
    },
    {
      description: "deeply nested object destructuring",
      code: `type DeepNestedObject = {
    parent: { child: { firstGrandChild: string; secondGrandChild: string } };
  };

  export function DisplayDeepNestedValues(props: DeepNestedObject) {
    const {
      parent: { child: { secondGrandChild, firstGrandChild } },
    } = props;
  }
`,
      output: `type DeepNestedObject = {
    parent: { child: { firstGrandChild: string; secondGrandChild: string } };
  };

  export function DisplayDeepNestedValues(props: DeepNestedObject) {
    const {
      parent: { child: { firstGrandChild, secondGrandChild } },
    } = props;
  }
`,
      errors: [{ messageId: "sort" }],
    },
    {
      description: "nested integration with sorted destructuring",
      code: `type NestedStructure = {
    group1: {
        subgroup1: { item1: string; item2: string };
        subgroup2: { item3: string; item4: string };
    };
    group2: {
        subgroup3: { item5: string; item6: string };
        subgroup4: { item7: string; item8: string };
    };
};

export function DisplayNestedStructure(props: NestedStructure) {
    const {
        group2: { subgroup4, subgroup3 },
        group1: { subgroup2, subgroup1 },
    } = props;
}
`,
      output: `type NestedStructure = {
    group1: {
        subgroup1: { item1: string; item2: string };
        subgroup2: { item3: string; item4: string };
    };
    group2: {
        subgroup3: { item5: string; item6: string };
        subgroup4: { item7: string; item8: string };
    };
};

export function DisplayNestedStructure(props: NestedStructure) {
    const {
        group1: { subgroup1, subgroup2 },
        group2: { subgroup3, subgroup4 },
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
      description: "nested properties sorted only inside destructuring",
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
      description:
        "nested properties organized but parent destructuring order corrected",
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
