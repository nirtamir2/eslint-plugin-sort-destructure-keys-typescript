import type { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type * as TSESLint from "@typescript-eslint/utils/ts-eslint";
import type ts from "typescript";
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
      return { type: "lintError", value: lastValue, shouldBeBefore: value };
    }

    lastIndex = index;
    lastValue = value;
  }

  return { type: "success" };
}

function getTypeDeclarationOrder({
  node,
  context,
  options,
}: {
  node: TSESTree.Node;
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
  options: { typeNameRegex?: string; includeAnonymousType?: boolean };
}) {
  const typeDeclarationsOrder: Array<string> = [];
  const services = ESLintUtils.getParserServices(context);
  const type = services.getTypeAtLocation(node);
  const typeName = type.symbol?.escapedName;
  if (
    typeName == null || type.symbol.escapedName === "__type"
      ? options.includeAnonymousType
      : options.typeNameRegex == null ||
        new RegExp(options.typeNameRegex).test(typeName)
  )
    for (const property of type.getProperties()) {
      if (typeof property?.escapedName === "string") {
        typeDeclarationsOrder.push(property.escapedName);
      }
    }
  return typeDeclarationsOrder;
}
function getTypeDeclerationOrder({
  type,
  options,
}: {
  type: ts.Type;
  options: { typeNameRegex?: string; includeAnonymousType?: boolean };
}) {
  const typeDeclarationsOrder: Array<string> = [];
  const typeName = type.symbol?.escapedName;
  if (
    typeName == null || type.symbol.escapedName === "__type"
      ? options.includeAnonymousType
      : options.typeNameRegex == null ||
        new RegExp(options.typeNameRegex).test(typeName)
  ) {
    const subTypes = type.isUnionOrIntersection() ? type.types : [type];
    for (const subType of subTypes) {
      for (const property of subType.getProperties()) {
        if (typeof property?.escapedName === "string") {
          typeDeclarationsOrder.push(property.escapedName);
        }
      }
    }
  }

  return typeDeclarationsOrder;
}

function checkProperty({
  property,
  context,
  options,
}: {
  property: TSESTree.Property | TSESTree.RestElement;
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
  options: { typeNameRegex?: string; includeAnonymousType?: boolean };
}) {
  if (
    property.value == null ||
    property.value.type !== AST_NODE_TYPES.ObjectPattern
  ) {
    return;
  }
  const nestedDestructuringVariableDeclarations: Array<TSESTree.Identifier> =
    [];

  for (const nestedProperty of property.value.properties) {
    if (nestedProperty.value == null) {
      continue;
    }
    switch (nestedProperty.value.type) {
      case AST_NODE_TYPES.ObjectPattern: {
        checkProperty({ property: nestedProperty, context, options });
        break;
      }
      case AST_NODE_TYPES.Identifier: {
        nestedDestructuringVariableDeclarations.push(nestedProperty.value);
        break;
      }
      case AST_NODE_TYPES.AssignmentPattern: {
        const leftProperty = nestedProperty.value.left;
        if (leftProperty.type === AST_NODE_TYPES.Identifier) {
          nestedDestructuringVariableDeclarations.push(leftProperty);
        }
        break;
      }
    }
  }
  const services = ESLintUtils.getParserServices(context);
  const type = services.getTypeAtLocation(property);
  const order = getTypeDeclerationOrder({ type, options });
  const result = checkOrder({
    order,
    values: nestedDestructuringVariableDeclarations,
  });
  if (result.type === "lintError") {
    reportError({ context, result });
  }
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

    return {
      VariableDeclaration(node) {
        for (const declaration of node.declarations) {
          const destructuringVariableDeclarations: Array<TSESTree.Identifier> =
            [];

          if (declaration.id.type === AST_NODE_TYPES.ObjectPattern) {
            for (const property of declaration.id.properties) {
              if (property.type === AST_NODE_TYPES.Property) {
                switch (property.value.type) {
                  case AST_NODE_TYPES.ObjectPattern: {
                    checkProperty({ property, context, options });
                    if (property.key.type === AST_NODE_TYPES.Identifier) {
                      destructuringVariableDeclarations.push(property.key);
                    }
                    break;
                  }
                  case AST_NODE_TYPES.Identifier: {
                    destructuringVariableDeclarations.push(property.value);
                    break;
                  }
                  case AST_NODE_TYPES.AssignmentPattern: {

                    if (property.key.type === AST_NODE_TYPES.Identifier) {
                      destructuringVariableDeclarations.push(property.key);
                    }

                    const leftProperty = property.value.left;
                    if (leftProperty.type === AST_NODE_TYPES.ObjectPattern) {
                      const nestedTypesOrder = getTypeDeclarationOrder({
                        node: leftProperty,
                        context,
                        options,
                      });

                      const nestedIdentifiers: Array<TSESTree.Identifier> = [];
                      for (const nestedProperty of leftProperty.properties) {
                        if (
                          nestedProperty.type === AST_NODE_TYPES.Property &&
                          nestedProperty.key.type === AST_NODE_TYPES.Identifier
                        ) {
                          nestedIdentifiers.push(nestedProperty.key);
                        }
                      }

                      const result = checkOrder({
                        order: nestedTypesOrder,
                        values: nestedIdentifiers,
                      });
                      if (result.type === "lintError") {
                        reportError({ context, result });
                      }
                    }
                    break;
                  }
                }
              }
            }
          }

          if (
            declaration.init == null ||
            declaration.init.type !== AST_NODE_TYPES.Identifier
          ) {
            return;
          }

          const typeDeclarationOrder = getTypeDeclarationOrder({
            node: declaration.init,
            context,
            options,
          });
          const result = checkOrder({
            order: typeDeclarationOrder,
            values: destructuringVariableDeclarations,
          });
          if (result.type === "lintError") {
            reportError({ context, result });
          }
        }
      },
    };
  },
});
