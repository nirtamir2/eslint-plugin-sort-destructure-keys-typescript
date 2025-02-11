import nirtamir2 from "@nirtamir2/eslint-config";
import sortDestructureKeysConfig from "eslint-plugin-sort-destructure-keys-typescript/config";
import typescriptEslintParser from "@typescript-eslint/parser";

// import { tsImport } from "tsx/esm/api";
// const local = await tsImport("./src/index.ts", import.meta.url).then(
//   (r) => r.default,
// );

export default nirtamir2(
  {
    type: "lib",
    typescript: false,
  },
  [
    {
      ignores: ["vendor", "**/*.md"],
    },
    {
      rules: {
        "sonarjs/cognitive-complexity": "off",
        "sonarjs/no-empty-test-file": "off",
      },
    },
    {
      // TODO: ignore those rules on markdown files only
      ignores: ["src/rules/sort-destructure-keys-by-type.md"],
      // rules: {
      //   "sonarjs/no-unused-vars": "off",
      //   "sonarjs/no-dead-store": "off",
      // },
    },
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      // set up typescript-eslint
      languageOptions: {
        parser: typescriptEslintParser,
        parserOptions: {
          project: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
    },
    {
      files: ["src/**/*.ts", "src/**/*.tsx"],
      ...sortDestructureKeysConfig(),
    },
  ],
).removeRules(["unicorn/no-empty-file"]);
// replace local config
// .onResolved((configs) => {
//   configs.forEach((config) => {
//     if (config?.plugins?.antfu) config.plugins.antfu = local;
//   });
// });
