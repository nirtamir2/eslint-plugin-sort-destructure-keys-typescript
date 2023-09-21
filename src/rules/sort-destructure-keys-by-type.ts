import type { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { createEslintRule } from "../utils";

export const RULE_NAME = "sort-destructure-keys-by-type";
export type MessageIds = "sort";
export type Options = [];

type OrderResult =
  | { type: "success" }
  | { type: "error"; value: TSESTree.Identifier; message: string }
  | {
      type: "lintError";
      value: TSESTree.Identifier;
      shouldBeBefore: TSESTree.Identifier;
    };

function checkOrder({
  order,
  values,
}: {
  order: Array<string>;
  values: Array<TSESTree.Identifier>;
}): OrderResult {
  let lastIndex = -1;
  let lastValue: TSESTree.Identifier | null = null;

  for (const value of values) {
    const index = order.indexOf(value.name);

    if (index === -1) {
      return { type: "error", value, message: "Not in order array" };
    }

    if (index < lastIndex && lastValue != null) {
      return { type: "lintError", value, shouldBeBefore: lastValue };
    }

    lastIndex = index;
    lastValue = value;
  }

  return { type: "success" };
}

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "layout",
    docs: {
      description: "Sort destructuring keys based on type order",
      recommended: "stylistic",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        maxProperties: 1,
        properties: {
          ignoreTypes: {
            type: "array",
            items: {
              type: "string",
            },
          },
          onlyTypes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      sort: `Expected object keys to be in sorted order by type order. Expected {{first}} to be before {{second}}.`,
    },
  },
  defaultOptions: [],
  create: (context) => {
    const options: {
      ignoreTypes?: Array<string>;
      onlyTypes?: Array<string>;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
    } = context.options[0] ?? {};
    return {
      VariableDeclaration(node) {
        for (const declaration of node.declarations) {
          if (declaration.id.type === AST_NODE_TYPES.ObjectPattern) {
            const destructuringVariableDeclarations: Array<TSESTree.Identifier> =
              [];
            const typeDeclarationsOrder: Array<string> = [];
            if (declaration.init?.type === AST_NODE_TYPES.Identifier) {
              const services = ESLintUtils.getParserServices(context);
              const type = services.getTypeAtLocation(declaration.init);
              const typeName = type.symbol.escapedName;

              const shouldIgnoreType =
                typeName == null ||
                (options.onlyTypes != null &&
                  !options.onlyTypes.includes(typeName)) ||
                (options.ignoreTypes != null &&
                  options.ignoreTypes.includes(typeName));

              if (!shouldIgnoreType)
                for (const property of type.getProperties()) {
                  if (typeof property.escapedName === "string") {
                    typeDeclarationsOrder.push(property.escapedName);
                  }
                }
            }
            for (const property of declaration.id.properties) {
              if (
                property.type === AST_NODE_TYPES.Property &&
                property.value.type === AST_NODE_TYPES.Identifier
              ) {
                destructuringVariableDeclarations.push(property.value);
              }
            }
            const result = checkOrder({
              order: typeDeclarationsOrder,
              values: destructuringVariableDeclarations,
            });
            if (result.type === "lintError") {
              context.report({
                node: result.value,
                messageId: "sort",
                data: {
                  first: result.shouldBeBefore.name,
                  second: result.value.name,
                },
                fix: (fixer) => {
                  return [
                    fixer.replaceText(result.value, result.shouldBeBefore.name),
                    fixer.replaceText(result.shouldBeBefore, result.value.name),
                  ];
                },
              });
            }
          }
        }
      },
    };
  },
});
