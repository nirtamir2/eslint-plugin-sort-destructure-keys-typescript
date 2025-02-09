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
      // This means we have an attribute that not exits in the type - we will ignore it
      continue;
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

function getNodeForContextualType(
  node: TSESTree.JSXOpeningElement,
): TSESTree.JSXIdentifier | TSESTree.JSXMemberExpression {
  switch (node.name.type) {
    // `<A a="" />`
    case AST_NODE_TYPES.JSXIdentifier: {
      return node.name;
    }
    // `<B.A a="" />`
    case AST_NODE_TYPES.JSXMemberExpression: {
      return node.name;
    }
    // `<B:A a="" />` but this syntax is not supported in React.
    // NOTICE: It works, but I have a problem with the types, so I cast to never
    case AST_NODE_TYPES.JSXNamespacedName: {
      return node.name as never;
    }
  }
}

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: "layout",
    docs: {
      description: "Sort JSX attributes keys based on type order",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          // TODO: options
          ignorePropertiesThatNotIncludesInType: {
            type: "boolean",
          },
          ignoreJSXTags: {
            type: "boolean",
          },
          ignoredSourceRegexes: {
            description: "List of regexes to ignore components",
            anyOf: [
              {
                type: ["array"],
                items: {
                  type: ["string"],
                },
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      sort: `Expected JSX attributes to be in sorted order by type order. Expected {{first}} to be before {{second}}.`,
    },
  },
  defaultOptions: [],
  create: (context) => {
    const services = ESLintUtils.getParserServices(context);
    const typeChecker = services.program.getTypeChecker();

    return {
      JSXOpeningElement(node) {
        const contextualTypeNode = getNodeForContextualType(node);

        const tsNode = services.esTreeNodeToTSNodeMap.get(contextualTypeNode);

        const propsType = typeChecker.getContextualType(tsNode);
        if (propsType == null) {
          return;
        }

        const propsTypePropertiesOrder = typeChecker
          .getPropertiesOfType(propsType)
          .map((a) => a.getName());

        const { attributes } = node;

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
