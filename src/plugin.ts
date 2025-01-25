import type { ESLint } from "eslint";
import { name, version } from "../package.json";
import sortDestructureKeysByType from "./rules/sort-destructure-keys-by-type";

export const plugin = {
  meta: {
    name,
    version,
  },
  // @keep-sorted
  rules: {
    "sort-destructure-keys-by-type": sortDestructureKeysByType,
  },
} satisfies ESLint.Plugin;
