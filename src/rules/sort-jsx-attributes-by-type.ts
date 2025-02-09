import type { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import { createEslintRule } from "../utils";

export const RULE_NAME = "sort-jsx-attributes-by-type";
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
  values: Array<TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute>;
}): OrderResult {
  let lastIndex = -1;
  let lastValue: TSESTree.Identifier | null = null;

  for (const value of values) {
    if (value.type !== AST_NODE_TYPES.JSXAttribute) {
      continue;
    }
    const vName = value.name;
    if (vName.type === AST_NODE_TYPES.JSXNamespacedName) {
      vName.name.name;
    }
    if (vName.type === AST_NODE_TYPES.JSXIdentifier) {
      vName.name;
    }
    let searchElement =
      vName.type === AST_NODE_TYPES.JSXNamespacedName
        ? value.name.name
        : vName.type === AST_NODE_TYPES.JSXIdentifier
          ? vName.name
          : "";

    const index = order.indexOf(searchElement);

    if (index === -1) {
      return { type: "error", value, message: "Not in order array" };
    }

    if (index < lastIndex && lastValue != null) {
      return { type: "lintError", value: lastValue, shouldBeBefore: value };
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
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          typeNameRegex: {
            type: "string",
          },
          includeAnonymousType: {
            type: "boolean",
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
      typeNameRegex?: string;
      includeAnonymousType?: boolean;
    } = Object.assign(
      { includeAnonymousType: true },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.options[0],
    );

    const services = ESLintUtils.getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    return {
      JSXIdentifier(node) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);

        const propsType = typeChecker.getContextualType(tsNode);
        if (propsType == null) {
          return;
        }

        const propsTypePropertiesOrder =
          typeChecker.getPropertiesOfType(propsType).map(a => a.getName());

        const { parent } = node.parent;
        if (parent?.type !== AST_NODE_TYPES.JSXOpeningElement) {
          return;
        }
        const { attributes } = parent;

        const result = checkOrder({
          order: propsTypePropertiesOrder,
          values: attributes,
        });

        console.log("result", result);
      },
    };
  },
});
