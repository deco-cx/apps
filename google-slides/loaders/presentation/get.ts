// deno-lint-ignore-file no-explicit-any
import type { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Presentation ID
   * @description The ID of the presentation to retrieve
   */
  presentationId: string;
}

interface SlideContent {
  id: string;
  text: string;
}

/**
 * Função recursiva para extrair apenas o conteúdo textual relevante
 */
function extractTextContent(element: any): string {
  // Caso base: se o elemento não existir
  if (!element) return "";

  // Se for um objeto com textRun.content, retorna o conteúdo
  if (element.textRun?.content) {
    return element.textRun.content.trim();
  }

  let result = "";

  // Se for um array, processa cada elemento
  if (Array.isArray(element)) {
    for (const item of element) {
      const text = extractTextContent(item);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }
    return result;
  }

  // Se for um objeto, verifica caminhos conhecidos que contêm texto
  if (typeof element === "object") {
    // Verifica shape.text.textElements (comum em slides)
    if (element.shape?.text?.textElements) {
      const text = extractTextContent(element.shape.text.textElements);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }

    // Verifica table.tableRows (para tabelas)
    if (element.table?.tableRows) {
      const text = extractTextContent(element.table.tableRows);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }

    // Verifica tableCells (para células dentro de tabelas)
    if (element.tableCells) {
      const text = extractTextContent(element.tableCells);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }

    // Verifica text.textElements (comum em células e outros elementos)
    if (element.text?.textElements) {
      const text = extractTextContent(element.text.textElements);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }

    // Verifica pageElements (principal elemento que contém itens do slide)
    if (element.pageElements) {
      const text = extractTextContent(element.pageElements);
      if (text) {
        result += (result ? " " : "") + text;
      }
    }

    // Se nenhum dos caminhos conhecidos tiver conteúdo, verifica todas as propriedades
    if (!result) {
      for (const key in element) {
        // Ignora propriedades que sabemos que não contêm conteúdo textual
        if (
          ["objectId", "width", "height", "transform", "type", "size", "style"]
            .includes(key)
        ) {
          continue;
        }

        const text = extractTextContent(element[key]);
        if (text) {
          result += (result ? " " : "") + text;
        }
      }
    }
  }

  return result;
}

/**
 * @title Fetch Presentation Google Slides
 * @description Retrieves a Google Slides presentation by ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlideContent[]> => {
  const response = await ctx.client
    ["GET /presentations/:presentationId"](
      { presentationId: props.presentationId },
    );

  const data = await response.json();

  const slides: SlideContent[] = data.slides?.map((slide: any) => {
    const slideId = slide.objectId;

    // Extrair o conteúdo textual do slide usando a função recursiva
    const slideText = extractTextContent(slide);

    return {
      id: slideId,
      text: slideText,
    };
  }) || [];

  return slides;
};

export default loader;
