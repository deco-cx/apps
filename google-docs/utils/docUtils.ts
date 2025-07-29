import { Document, Paragraph, StructuralElement, TextRun } from "./types.ts";

export function extractTextFromDocument(document: Document): string {
  if (!document.body?.content) {
    return "";
  }

  return document.body.content
    .map((element) => extractTextFromStructuralElement(element))
    .filter(Boolean)
    .join("\n");
}

export function extractTextFromStructuralElement(
  element: StructuralElement,
): string {
  if (element.paragraph) {
    return extractTextFromParagraph(element.paragraph);
  }

  if (element.table) {
    return element.table.tableRows
      .map((row) =>
        row.tableCells
          .map((cell) =>
            cell.content
              .map((content) => extractTextFromStructuralElement(content))
              .join(" ")
          )
          .join(" | ")
      )
      .join("\n");
  }

  return "";
}

export function extractTextFromParagraph(paragraph: Paragraph): string {
  return paragraph.elements
    .map((element) => {
      if (element.textRun) {
        return element.textRun.content;
      }
      return "";
    })
    .join("");
}

export function createSimpleTextRun(content: string): TextRun {
  return {
    content,
    textStyle: {},
  };
}

export function createFormattedTextRun(
  content: string,
  options: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
  } = {},
): TextRun {
  return {
    content,
    textStyle: {
      bold: options.bold,
      italic: options.italic,
      underline: options.underline,
      fontSize: options.fontSize
        ? {
          magnitude: options.fontSize,
          unit: "PT",
        }
        : undefined,
    },
  };
}

export function validateDocumentId(documentId: string): boolean {
  if (!documentId || typeof documentId !== "string") {
    return false;
  }

  const docIdRegex = /^[a-zA-Z0-9-_]+$/;
  return docIdRegex.test(documentId) && documentId.length > 10;
}

export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    // deno-lint-ignore no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function convertHtmlToPlainText(html: string): string {
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export function formatDocumentTitle(title: string): string {
  if (!title) return "Untitled Document";

  return title.trim().substring(0, 100);
}

export function createDocumentFromText(
  title: string,
  content: string,
): { title: string; body: { content: StructuralElement[] } } {
  const paragraphs = content.split("\n").filter(Boolean);

  const structuralElements: StructuralElement[] = paragraphs.map((
    text,
    index,
  ) => ({
    startIndex: index,
    endIndex: index + text.length,
    paragraph: {
      elements: [{
        textRun: createSimpleTextRun(text + "\n"),
      }],
    },
  }));

  return {
    title: formatDocumentTitle(title),
    body: {
      content: structuralElements,
    },
  };
}

export function calculateDocumentWordCount(document: Document): number {
  const text = extractTextFromDocument(document);
  if (!text) return 0;

  return text
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

export function calculateDocumentCharacterCount(document: Document): number {
  const text = extractTextFromDocument(document);
  return text.length;
}

export function extractDocumentHeadings(document: Document): string[] {
  if (!document.body?.content) return [];

  const headings: string[] = [];

  for (const element of document.body.content) {
    if (element.paragraph?.paragraphStyle?.namedStyleType) {
      const styleType = element.paragraph.paragraphStyle.namedStyleType;
      if (styleType.startsWith("HEADING_")) {
        const text = extractTextFromParagraph(element.paragraph);
        if (text.trim()) {
          headings.push(text.trim());
        }
      }
    }
  }

  return headings;
}

export function createTableOfContents(document: Document): string {
  const headings = extractDocumentHeadings(document);

  return headings
    .map((heading, index) => `${index + 1}. ${heading}`)
    .join("\n");
}
