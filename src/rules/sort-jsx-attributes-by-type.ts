import { TSESTree } from "@typescript-eslint/types";
import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";
import type * as TSESLint from "@typescript-eslint/utils/ts-eslint";
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
  values: Array<string>;
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

function getComponentName(component: TSESTree.JSXTagNameExpression): string {
  switch (component.type) {
    case AST_NODE_TYPES.JSXIdentifier: {
      return component.name;
    }
    case "JSXMemberExpression": {
      return `${getComponentName(
        component.object,
      )}.${getComponentName(component.property)}`;
    }
    case AST_NODE_TYPES.JSXNamespacedName: {
      return getComponentName(component);
    }
    default: {
      throw new Error(`Unknown name type: ${component.type}`);
    }
  }
}

function getTypeDeclarationNestedOrder({
  declaration,
  context,
  options,
}: {
  declaration: TSESTree.Property | TSESTree.RestElement;
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>;
  options: { typeNameRegex?: string; includeAnonymousType?: boolean };
}) {
  const typeDeclarationsOrder: Array<string> = [];
  const services = ESLintUtils.getParserServices(context);
  const type = services.getTypeAtLocation(declaration);
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

function checkNestedProperty({
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
    if (nestedProperty.value.type === AST_NODE_TYPES.ObjectPattern) {
      checkNestedProperty({ property: nestedProperty, context, options });
    } else if (nestedProperty.value.type === AST_NODE_TYPES.Identifier) {
      nestedDestructuringVariableDeclarations.push(nestedProperty.value);
    }
  }
  const result = checkOrder({
    order: getTypeDeclarationNestedOrder({
      declaration: property,
      context,
      options,
    }),
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
      JSXElement(node) {
        const attributes = node.openingElement.attributes;
        const componentName = getComponentName(node.openingElement.name);

        // Now need to find the type of the component and then to find the props and get the order...
        // This is when I stuck...

        const typeDeclarationsOrder: Array<string> = [];
        const services = ESLintUtils.getParserServices(context);
        const type = services.getTypeAtLocation(node.openingElement);

        // Get the type of the function parameter (props)
        const typeChecker = services.program.getTypeChecker();
        const propsType = typeChecker.getTypeAtLocation(node.openingElement);

        // Get all properties of the `props` type
        const properties = typeChecker.getPropertiesOfType(propsType);

        // Log the names of the properties
        for (const property of properties) {
          console.log(property.name); // This will log "a" and "b"
        }

        if (propsType && propsType.valueDeclaration) {
          const propsTypeOfProps = typeChecker.getTypeOfSymbolAtLocation(
            propsType,
            propsType.valueDeclaration,
          );

          // Get all properties of the `props` type
          const properties = typeChecker.getPropertiesOfType(propsTypeOfProps);

          for (const property of properties) {
            console.log(property.name);
          }
        }

        // const propsType = type.getProperties().find((property) => property.escapedName === "props");
        const typeName = type.symbol?.escapedName;
        if (
          typeName == null || type.symbol.escapedName === "__type"
            ? options.includeAnonymousType
            : options.typeNameRegex == null ||
              new RegExp(options.typeNameRegex).test(typeName)
        ) {
          for (const property of propsType.getProperties()) {
            if (typeof property?.escapedName === "string") {
              typeDeclarationsOrder.push(property.escapedName);
            }
          }
        }
        return typeDeclarationsOrder;
      },
    };
  },
});
