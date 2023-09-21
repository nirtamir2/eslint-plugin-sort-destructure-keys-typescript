import type { ESLint, Linter } from "eslint";
import { version } from "../package.json";
import sortDestructureKeysByType from "./rules/sort-destructure-keys-by-type";

const plugin = {
  meta: {
    name: "sort-destructure-keys-typescript",
    version,
  },
  // @keep-sorted
  rules: {
    "sort-destructure-keys-by-type": sortDestructureKeysByType,
  },
} satisfies ESLint.Plugin;

export default plugin;

type RuleDefinitions = (typeof plugin)["rules"];

export type RuleOptions = {
  [K in keyof RuleDefinitions]: RuleDefinitions[K]["defaultOptions"];
};

export type Rules = {
  [K in keyof RuleOptions]: Linter.RuleEntry<RuleOptions[K]>;
};
