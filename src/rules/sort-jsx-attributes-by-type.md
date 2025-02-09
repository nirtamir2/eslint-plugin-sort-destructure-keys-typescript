# sort-jsx-attributes-by-type

JSX attributes should be sorted by the matching TypeScript type properties order.

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/nirtamir2/eslint-plugin-unicorn#preset-configs-eslintconfigjs).

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

## Rule Details

<!-- eslint-skip -->

```tsx
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  return <div />;
}

// 👎 bad
<Example email="email" name="name" />;
```

<!-- eslint-skip -->

```tsx
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  return <div />;
}

// 👍 good
<Example name="name" email="email" />;
```

## Options

Type: `object`

### includeAnonymousType

Type: `boolean`

Pass `{includeAnonymousType: false}` to exclude this lint rule from running on anonymous types
(without an identifier name, inline type)

Default: `{includeAnonymousType: true}`

#### Pass

```ts
// sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {includeAnonymousType: false}]}]

export function Example(props: { name: string; email: string }) {
  const { email, name } = props;
}
```

#### Fail

<!-- eslint-skip -->

```ts
// sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {includeAnonymousType: true}]}]

export function Example(props: { name: string; email: string }) {
  const { email, name } = props;
}
```

<!-- eslint-skip -->

### typeNameRegex

Type: `string`

Pass `{typeNameRegex: "Props|MyTypeName"}` to lint-only types that their name match the regex

#### Pass

```ts
// sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {typeNameRegex: "^(?!.*Props).*$"}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

#### Fail

<!-- eslint-skip -->

```ts
// sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {typeNameRegex: "Props|Other"}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

<!-- eslint-skip -->
