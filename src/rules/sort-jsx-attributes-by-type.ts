import type { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type * as TSESLint from "@typescript-eslint/utils/ts-eslint";
import { createEslintRule } from "../utils";

export const RULE_NAME = "sort-jsx-attributes-by-type";
export type MessageIds = "sort";
export type Options = [];

type OrderResult =
  | { type: "success" }
  | { type: "error"; value: TSESTree.JSXAttribute; message: string }
  | {
      type: "lintError";
      value: TSESTree.JSXAttribute;
      shouldBeBefore: TSESTree.JSXAttribute;
    };

function getJSXIdentifierOrNamespaceName(
  value: TSESTree.JSXIdentifier | TSESTree.JSXNamespacedName,
): string | null {
  if (value.type === AST_NODE_TYPES.JSXNamespacedName) {
    return value.name.name;
  }
  if (value.type === AST_NODE_TYPES.JSXIdentifier) {
    return value.name;
  }
  return null;
}

function checkOrder({
  order,
  attributes,
}: {
  order: Array<string>;
  attributes: Array<TSESTree.JSXAttribute | TSESTree.JSXSpreadAttribute>;
}): OrderResult {
  let lastIndex = -1;
  let lastValue: TSESTree.JSXAttribute | null = null;

  for (const value of attributes) {
    if (value.type !== AST_NODE_TYPES.JSXAttribute) {
      continue;
    }
    const jsxIdentifierOrNamespaceName = getJSXIdentifierOrNamespaceName(
      value.name,
    );
    if (jsxIdentifierOrNamespaceName == null) {
      continue;
    }
    const index = order.indexOf(jsxIdentifierOrNamespaceName);

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

function reportError({
  context,
  result,
}: {
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
  result: {
    value: TSESTree.JSXAttribute;
    shouldBeBefore: TSESTree.JSXAttribute;
  };
}) {
  context.report({
    node: result.value,
    messageId: "sort",
    data: {
      first: result.shouldBeBefore.name,
      second: result.value.name,
    },
    fix: (fixer) => {
      return [
        fixer.replaceTextRange(
          result.value.range,
          context.sourceCode.getText(result.shouldBeBefore),
        ),
        fixer.replaceTextRange(
          result.shouldBeBefore.range,
          context.sourceCode.getText(result.value),
        ),
      ];
    },
  });
}

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "layout",
    docs: {
      description: "Sort JSX attributes keys based on type order",
    },
    fixable: "code",
    schema: [],
    messages: {
      sort: `Expected JSX attributes to be in sorted order by type order. Expected {{first}} to be before {{second}}.`,
    },
  },
  defaultOptions: [],
  create: (context) => {
    const services = ESLintUtils.getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    return {
      JSXIdentifier(node) {
        const tsNode = services.esTreeNodeToTSNodeMap.get(node);

        const propsType = typeChecker.getContextualType(tsNode);
        if (propsType == null) {
          return;
        }

        const propsTypePropertiesOrder = typeChecker
          .getPropertiesOfType(propsType)
          .map((a) => a.getName());

        const { parent } = node;
        if (parent?.type !== AST_NODE_TYPES.JSXOpeningElement) {
          return;
        }
        const { attributes } = parent;

        const result = checkOrder({
          order: propsTypePropertiesOrder,
          attributes,
        });

        if (result.type === "lintError") {
          reportError({ context, result });
        }
      },
    };
  },
});
