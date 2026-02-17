import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaStyle,
} from "./client.ts";

type SimplifiedNode = Omit<Partial<FigmaNode>, "children"> & {
  children?: SimplifiedNode[];
};

/**
 * @description Simplifies a Figma node to include only the most relevant information
 * @param node The Figma node to be simplified
 * @returns The simplified node
 */
export function simplifyNode(node: FigmaNode): SimplifiedNode | null {
  if (!node) return null;

  // Extract basic properties
  const simplified: SimplifiedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Adds specific properties based on node type
  const properties = [
    "absoluteBoundingBox",
    "relativeTransform",
    "layout",
    "fills",
    "strokes",
    "effects",
    "opacity",
    "visible",
    "clipsContent",
    "backgroundColor",
    "cornerRadius",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "paddingBottom",
    "itemSpacing",
    "counterAxisSizingMode",
    "primaryAxisSizingMode",
    "primaryAxisAlignItems",
    "counterAxisAlignItems",
  ];

  if (
    node.type === "FRAME" || node.type === "GROUP" ||
    node.type === "COMPONENT" || node.type === "INSTANCE"
  ) {
    for (const prop of properties) {
      if (node[prop] !== undefined) {
        simplified[prop] = node[prop];
      }
    }
  }

  if (node.type === "TEXT") {
    if (node.characters) {
      simplified.characters = node.characters;
    }
    if (node.style) {
      simplified.style = node.style;
    }
    for (
      const prop of [
        "absoluteBoundingBox",
        "relativeTransform",
        "fills",
        "opacity",
        "visible",
      ]
    ) {
      if (node[prop] !== undefined) {
        simplified[prop] = node[prop];
      }
    }
  }

  if (
    node.type === "RECTANGLE" || node.type === "ELLIPSE" ||
    node.type === "POLYGON" || node.type === "STAR" || node.type === "VECTOR"
  ) {
    for (const prop of properties) {
      if (node[prop] !== undefined) {
        simplified[prop] = node[prop];
      }
    }
  }

  if (node.type === "LINE") {
    for (
      const prop of [
        "absoluteBoundingBox",
        "relativeTransform",
        "strokes",
        "effects",
        "opacity",
        "visible",
      ]
    ) {
      if (node[prop] !== undefined) {
        simplified[prop] = node[prop];
      }
    }
  }

  // Process children recursively
  if (node.children && Array.isArray(node.children)) {
    const simplifiedChildren = node.children
      .map((child) => simplifyNode(child))
      .filter((child): child is SimplifiedNode => child !== null);

    if (simplifiedChildren.length > 0) {
      simplified.children = simplifiedChildren;
    }
  }

  return simplified;
}

/**
 * @description Simplifies a Figma component to include only the most relevant information
 * @param component The Figma component to be simplified
 * @returns The simplified component
 */
export function simplifyComponent(component: FigmaComponent): FigmaComponent {
  if (!component) {
    return {
      key: "",
      name: "",
      description: "",
      remote: false,
      documentationLinks: undefined,
    };
  }

  return {
    key: component.key,
    name: component.name,
    description: component.description || "",
    remote: component.remote || false,
    documentationLinks: component.documentationLinks,
  };
}

/**
 * @description Simplifies a Figma component set to include only the most relevant information
 * @param componentSet The Figma component set to be simplified
 * @returns The simplified component set
 */
export function simplifyComponentSet(
  componentSet: FigmaComponentSet,
): FigmaComponentSet {
  if (!componentSet) {
    return {
      key: "",
      name: "",
      description: "",
    };
  }

  return {
    key: componentSet.key,
    name: componentSet.name,
    description: componentSet.description || "",
  };
}

/**
 * @description Simplifies a Figma style to include only the most relevant information
 * @param style The Figma style to be simplified
 * @returns The simplified style
 */
export function simplifyStyle(style: FigmaStyle): FigmaStyle {
  if (!style) {
    return {
      key: "",
      name: "",
      description: "",
      remote: false,
    };
  }

  return {
    key: style.key,
    name: style.name,
    description: style.description || "",
    remote: style.remote || false,
  };
}

/**
 * @description Simplifies a Figma document to include only the most relevant information
 * @param document The Figma document to be simplified
 * @returns The simplified document
 */
export function simplifyDocument(document: FigmaNode): SimplifiedNode | null {
  if (!document) return null;
  return simplifyNode(document);
}
