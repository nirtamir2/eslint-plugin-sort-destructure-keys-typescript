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
    }
  ],
});
