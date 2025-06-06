import {
  DOMParser,
  Element,
  Node,
} from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

type TextContent = {
  type: "text";
  text: string;
  marks?: Array<{
    type: "bold" | "italic" | "underline" | "strike" | "code" | "link";
    attrs?: Record<string, string | number | boolean>;
  }>;
};

type NodeAttrs = {
  level?: number;
  indent?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  start?: number;
  [key: string]: string | number | boolean | undefined;
};

type NodeContent = {
  type:
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "listItem"
    | "codeBlock"
    | "blockquote"
    | "horizontalRule";
  attrs?: NodeAttrs;
  content?: Array<NodeContent | TextContent>;
};

export type Content = {
  type: "doc";
  content: Array<NodeContent>;
};

export function htmlToTiptapJson(htmlString: string): Content {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  function processNode(node: Node): NodeContent | TextContent | null {
    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return null;
      return {
        type: "text",
        text: text,
      };
    }

    // Handle element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // Process child nodes
      const children = Array.from(element.childNodes)
        .map(processNode)
        .filter((node): node is NodeContent | TextContent => node !== null);

      // Handle different element types
      switch (element.tagName.toLowerCase()) {
        case "h2":
          return {
            type: "heading",
            attrs: { level: 2 },
            content: children,
          };
        case "h1":
          return {
            type: "heading",
            attrs: { level: 1 },
            content: children,
          };
        case "h3":
          return {
            type: "heading",
            attrs: { level: 3 },
            content: children,
          };
        case "p":
          return {
            type: "paragraph",
            content: children,
          };
        case "ul":
          return {
            type: "bulletList",
            content: children,
          };
        case "li":
          return {
            type: "listItem",
            content: children,
          };
        case "blockquote":
          return {
            type: "blockquote",
            content: children,
          };
        case "hr":
          return {
            type: "horizontalRule",
          };
        case "br":
          return {
            type: "text",
            text: "\n",
          };
        case "strong":
          return {
            type: "text",
            text: element.textContent || "",
            marks: [{ type: "bold" }],
          };
        case "em":
          return {
            type: "text",
            text: element.textContent || "",
            marks: [{ type: "italic" }],
          };
        case "a":
          return {
            type: "text",
            text: element.textContent || "",
            marks: [{
              type: "link",
              attrs: {
                href: element.getAttribute("href") || "",
              },
            }],
          };
      }
    }
    return null;
  }

  // Process all top-level nodes
  const content = Array.from(doc?.body?.childNodes || [])
    .map(processNode)
    .filter((node): node is NodeContent => node !== null);

  return {
    type: "doc",
    content,
  };
}
