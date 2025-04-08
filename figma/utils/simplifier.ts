import type {
  FigmaComponent,
  FigmaComponentSet,
  FigmaNode,
  FigmaStyle,
} from "../client.ts";

/**
 * @description Simplifica um nó do Figma para incluir apenas as informações mais relevantes
 * @param node O nó do Figma a ser simplificado
 * @returns O nó simplificado
 */
export function simplifyNode(node: FigmaNode): any {
  if (!node) return null;

  // Extrair propriedades básicas
  const simplified: any = {
    id: node.id,
    name: node.name,
    type: node.type,
  };

  // Adicionar propriedades específicas com base no tipo de nó
  if (
    node.type === "FRAME" || node.type === "GROUP" ||
    node.type === "COMPONENT" || node.type === "INSTANCE"
  ) {
    if (node.absoluteBoundingBox) {
      simplified.absoluteBoundingBox = node.absoluteBoundingBox;
    }
    if (node.relativeTransform) {
      simplified.relativeTransform = node.relativeTransform;
    }
    if (node.layout) {
      simplified.layout = node.layout;
    }
    if (node.fills) {
      simplified.fills = node.fills;
    }
    if (node.strokes) {
      simplified.strokes = node.strokes;
    }
    if (node.effects) {
      simplified.effects = node.effects;
    }
    if (node.opacity !== undefined) {
      simplified.opacity = node.opacity;
    }
    if (node.visible !== undefined) {
      simplified.visible = node.visible;
    }
    if (node.clipsContent !== undefined) {
      simplified.clipsContent = node.clipsContent;
    }
    if (node.backgroundColor) {
      simplified.backgroundColor = node.backgroundColor;
    }
    if (node.cornerRadius !== undefined) {
      simplified.cornerRadius = node.cornerRadius;
    }
    if (node.paddingLeft !== undefined) {
      simplified.paddingLeft = node.paddingLeft;
    }
    if (node.paddingRight !== undefined) {
      simplified.paddingRight = node.paddingRight;
    }
    if (node.paddingTop !== undefined) {
      simplified.paddingTop = node.paddingTop;
    }
    if (node.paddingBottom !== undefined) {
      simplified.paddingBottom = node.paddingBottom;
    }
    if (node.itemSpacing !== undefined) {
      simplified.itemSpacing = node.itemSpacing;
    }
    if (node.counterAxisSizingMode) {
      simplified.counterAxisSizingMode = node.counterAxisSizingMode;
    }
    if (node.primaryAxisSizingMode) {
      simplified.primaryAxisSizingMode = node.primaryAxisSizingMode;
    }
    if (node.primaryAxisAlignItems) {
      simplified.primaryAxisAlignItems = node.primaryAxisAlignItems;
    }
    if (node.counterAxisAlignItems) {
      simplified.counterAxisAlignItems = node.counterAxisAlignItems;
    }
  }

  if (node.type === "TEXT") {
    if (node.characters) {
      simplified.characters = node.characters;
    }
    if (node.style) {
      simplified.style = node.style;
    }
    if (node.absoluteBoundingBox) {
      simplified.absoluteBoundingBox = node.absoluteBoundingBox;
    }
    if (node.relativeTransform) {
      simplified.relativeTransform = node.relativeTransform;
    }
    if (node.fills) {
      simplified.fills = node.fills;
    }
    if (node.opacity !== undefined) {
      simplified.opacity = node.opacity;
    }
    if (node.visible !== undefined) {
      simplified.visible = node.visible;
    }
  }

  if (
    node.type === "RECTANGLE" || node.type === "ELLIPSE" ||
    node.type === "POLYGON" || node.type === "STAR" || node.type === "VECTOR"
  ) {
    if (node.absoluteBoundingBox) {
      simplified.absoluteBoundingBox = node.absoluteBoundingBox;
    }
    if (node.relativeTransform) {
      simplified.relativeTransform = node.relativeTransform;
    }
    if (node.fills) {
      simplified.fills = node.fills;
    }
    if (node.strokes) {
      simplified.strokes = node.strokes;
    }
    if (node.effects) {
      simplified.effects = node.effects;
    }
    if (node.opacity !== undefined) {
      simplified.opacity = node.opacity;
    }
    if (node.visible !== undefined) {
      simplified.visible = node.visible;
    }
    if (node.cornerRadius !== undefined) {
      simplified.cornerRadius = node.cornerRadius;
    }
  }

  if (node.type === "LINE") {
    if (node.absoluteBoundingBox) {
      simplified.absoluteBoundingBox = node.absoluteBoundingBox;
    }
    if (node.relativeTransform) {
      simplified.relativeTransform = node.relativeTransform;
    }
    if (node.strokes) {
      simplified.strokes = node.strokes;
    }
    if (node.effects) {
      simplified.effects = node.effects;
    }
    if (node.opacity !== undefined) {
      simplified.opacity = node.opacity;
    }
    if (node.visible !== undefined) {
      simplified.visible = node.visible;
    }
  }

  // Processar filhos recursivamente
  if (node.children && Array.isArray(node.children)) {
    simplified.children = node.children.map((child) => simplifyNode(child));
  }

  return simplified;
}

/**
 * @description Simplifica um componente do Figma para incluir apenas as informações mais relevantes
 * @param component O componente do Figma a ser simplificado
 * @returns O componente simplificado
 */
export function simplifyComponent(component: FigmaComponent): any {
  if (!component) return null;

  return {
    key: component.key,
    name: component.name,
    description: component.description,
  };
}

/**
 * @description Simplifica um conjunto de componentes do Figma para incluir apenas as informações mais relevantes
 * @param componentSet O conjunto de componentes do Figma a ser simplificado
 * @returns O conjunto de componentes simplificado
 */
export function simplifyComponentSet(componentSet: FigmaComponentSet): any {
  if (!componentSet) return null;

  return {
    key: componentSet.key,
    name: componentSet.name,
  };
}

/**
 * @description Simplifica um estilo do Figma para incluir apenas as informações mais relevantes
 * @param style O estilo do Figma a ser simplificado
 * @returns O estilo simplificado
 */
export function simplifyStyle(style: FigmaStyle): any {
  if (!style) return null;

  return {
    key: style.key,
    name: style.name,
  };
}

/**
 * @description Simplifica um documento do Figma para incluir apenas as informações mais relevantes
 * @param document O documento do Figma a ser simplificado
 * @returns O documento simplificado
 */
export function simplifyDocument(document: FigmaNode): any {
  if (!document) return null;

  return simplifyNode(document);
}
