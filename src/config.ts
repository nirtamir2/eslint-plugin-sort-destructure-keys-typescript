import type { Linter } from "eslint";
import { name } from "../package.json";
import { plugin } from "./plugin";

export default function config(
  options: { strict?: boolean } = {},
): Linter.Config {
  return {
    name,
    plugins: {
      [name]: plugin,
    },
    rules: {
      [`${name}/sort-destructure-keys-by-type`]: options.strict
        ? "error"
        : "warn",
    },
  };
}
