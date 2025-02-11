import type { TSESTree } from "@typescript-eslint/types";
import type { ParserServicesWithTypeInformation } from "@typescript-eslint/utils";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type * as TSESLint from "@typescript-eslint/utils/ts-eslint";
import type ts from "typescript";
import { createEslintRule } from "../utils";

export const RULE_NAME = "sort-object-properties-by-type";
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
    value: TSESTree.Identifier;
    shouldBeBefore: TSESTree.Identifier;
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
          result.value.parent.range,
          context.sourceCode.getText(result.shouldBeBefore.parent),
        ),
        fixer.replaceTextRange(
          result.shouldBeBefore.parent.range,
          context.sourceCode.getText(result.value.parent),
        ),
      ];
    },
  });
}

function getTypeOrder({
  services,
  objectExpression,
  typeChecker,
}: {
  services: ParserServicesWithTypeInformation;
  objectExpression: TSESTree.ObjectExpression;
  typeChecker: ts.TypeChecker;
}) {
  const tsNode = services.esTreeNodeToTSNodeMap.get(objectExpression.parent);
  const type = typeChecker.getTypeAtLocation(tsNode);
  return typeChecker.getPropertiesOfType(type).map((a) => a.getName());
}

function handleObjectExpression({
  objectExpression,
  order,
  context,
}: {
  objectExpression: TSESTree.ObjectExpression;
  order: Array<string>;
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
}) {
  const identifiers: Array<TSESTree.Identifier> = [];

  for (const property of objectExpression.properties) {
    switch (property.type) {
      case AST_NODE_TYPES.SpreadElement: {
        continue;
      }
      case AST_NODE_TYPES.Property: {
        if (
          property.type === AST_NODE_TYPES.Property &&
          property.key.type === AST_NODE_TYPES.Identifier
        ) {
          identifiers.push(property.key);
        }
      }
    }
  }
  const result = checkOrder({
    values: identifiers,
    order,
  });
  if (result.type === "lintError") {
    reportError({ context, result });
  }
}

function handleArrayExpression({
  services,
  arrayExpression,
  typeChecker,
  context,
}: {
  services: ParserServicesWithTypeInformation;
  arrayExpression: TSESTree.ArrayExpression;
  typeChecker: ts.TypeChecker;
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
}) {
  const tsNode = services.esTreeNodeToTSNodeMap.get(arrayExpression.parent);
  const arrayType = typeChecker.getTypeAtLocation(tsNode);
  const type = arrayType.getNumberIndexType();
  if (type == null) {
    return;
  }
  const propsTypePropertiesOrder = typeChecker
    .getPropertiesOfType(type)
    .map((a) => a.getName());

  for (const property of arrayExpression.elements) {
    if (property == null) {
      continue;
    }

    if (property.type === AST_NODE_TYPES.ObjectExpression) {
      handleObjectExpression({
        objectExpression: property,
        context,
        order: propsTypePropertiesOrder,
      });
    }
  }
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
      sort: `Expected object keys to be sorted order by type order. Expected \`{{first}}\` to be before \`{{second}}\`.`,
    },
  },
  defaultOptions: [],
  create: (context) => {
    const services = ESLintUtils.getParserServices(context);
    const typeChecker = services.program.getTypeChecker();
    return {
      VariableDeclaration(node) {
        for (const declaration of node.declarations) {
          if (declaration.init == null) {
            continue;
          }
          switch (declaration.init.type) {
            case AST_NODE_TYPES.ObjectExpression: {
              const propsTypePropertiesOrder = getTypeOrder({
                services,
                objectExpression: declaration.init,
                typeChecker,
              });
              handleObjectExpression({
                context,
                objectExpression: declaration.init,
                order: propsTypePropertiesOrder,
              });
              break;
            }
            case AST_NODE_TYPES.ArrayExpression: {
              handleArrayExpression({
                services,
                arrayExpression: declaration.init,
                typeChecker,
                context,
              });
              break;
            }
          }
        }
      },
    };
  },
});
