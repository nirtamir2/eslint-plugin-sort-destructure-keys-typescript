# sort-destructure-keys-by-type

Keys in an object pattern should be sorted by the matching TypeScript type properties order

💼 This rule is enabled in the ✅ `recommended` [config](https://github.com/nirtamir2/eslint-plugin-unicorn#preset-configs-eslintconfigjs).

🔧💡 This rule is automatically fixable by the [`--fix` CLI option](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix) and manually fixable by [editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

## Rule Details

<!-- eslint-skip -->

```ts
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  // 👎 bad
  const { email, name } = props;
}
```

<!-- eslint-skip -->

```ts
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  // 👍 good
  const { name, email } = props;
}
```

## Options

Type: `object`

### onlyTypes

Type: `Array<string>`

Pass `{onlyTypes: ["Props"]}` to lint only types with matching names

#### Pass

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"onlyTypes": ["NotProps"]}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"onlyTypes": []}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

### Fail

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"onlyTypes": ["Props"]}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

### ignoreTypes

Type: `Array<string>`

Pass `{ignoreTypes: ["Props"]}` to lint only types with matching names

#### Pass

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"ignoreTypes": ["Props"]}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

### Fail

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"ignoreTypes": ["NotProps"]}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```

```ts
// eslint sort-destructure-keys-typescript/sort-destructure-keys-by-type: ["error", {"ignoreTypes": []}]
type Props = {
  name: string;
  email: string;
};

export function Example(props: Props) {
  const { email, name } = props;
}
```
