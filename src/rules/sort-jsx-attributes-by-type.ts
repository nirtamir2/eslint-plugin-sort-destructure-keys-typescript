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
        const {attributes} = node.openingElement;
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
      },
    };
  },
});
