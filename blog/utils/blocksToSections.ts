import { type Section } from "@deco/deco/blocks";
import { Resolved } from "@deco/deco";

/** Minimal Block type — matches the structure returned by the Spire API. */
interface Block {
  type?: string;
  position?: number;
  content?: Record<string, unknown>;
  system_block_id?: string;
  custom_block_id?: string;
}

const BASE = "blog/sections/blocks";

function toSection(
  resolveType: string,
  props: Record<string, unknown>,
): Section {
  return { __resolveType: resolveType, ...props } as unknown as Section;
}

/**
 * Converts a Spire Block array into Deco Section[] using blog/sections/blocks components.
 * Sections are sorted by block position before conversion.
 * Supports an optional override map to remap block types to custom section renderers.
 */
export function blocksToSections(
  blocks: Block[],
  overrides: Record<string, Resolved<Section>> = {},
): Section[] {
  return [...blocks]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((block) => blockToSection(block, overrides))
    .filter((s): s is Section => s !== null);
}

/**
 * The Spire FAQ block carries each answer as HTML/text, while the FAQ section
 * takes a Section[] body — so every answer becomes a single Paragraph section.
 * Accepts the items as an array or as a JSON-encoded string.
 */
function toFaqItems(raw: unknown): { title: string; body: Section[] }[] {
  let items: Record<string, unknown>[] = [];

  if (Array.isArray(raw)) {
    items = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    } catch { /* ignore */ }
  }

  // A question with no usable title is not renderable, and a non-string field
  // would blow up the sanitizer downstream — drop both instead.
  return items.flatMap((item) => {
    const title = asString(item?.title);
    if (!title) return [];

    return [{
      title,
      body: [
        toSection(`${BASE}/Paragraph.tsx`, {
          html: asString(item?.html) ?? asString(item?.body),
          text: asString(item?.text),
        }),
      ],
    }];
  });
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function blockToSection(
  block: Block,
  overrides: Record<string, Resolved<Section>>,
): Section | null {
  const content = block.content as Record<string, unknown>;

  if ("type" in block && block.type) {
    if (overrides[block.type]) {
      return toSection(
        overrides[block.type]?.__resolveType ?? block.type,
        block.content as Record<string, unknown>,
      );
    }

    switch (block.type) {
      case "paragraph":
        return toSection(`${BASE}/Paragraph.tsx`, {
          html: content.html,
          text: content.text,
        });

      case "heading":
        return toSection(`${BASE}/Heading.tsx`, {
          text: content.text,
          level: content.level,
        });

      case "list":
        return toSection(`${BASE}/List.tsx`, {
          items: content.items,
          style: content.style,
        });

      case "divider":
        return toSection(`${BASE}/Divider.tsx`, {});

      case "quote":
        return toSection(`${BASE}/Quote.tsx`, {
          quote: content.quote,
          text: content.text,
          attribution: content.attribution,
          source: content.source,
        });

      case "callout":
        return toSection(`${BASE}/Callout.tsx`, {
          title: content.title,
          body: content.body,
          variant: content.variant,
        });

      case "checklist":
        return toSection(`${BASE}/Checklist.tsx`, {
          title: content.title,
          items: content.items,
        });

      case "steps":
        return toSection(`${BASE}/Steps.tsx`, {
          title: content.title,
          steps: content.steps,
        });

      case "stat":
        return toSection(`${BASE}/Stat.tsx`, {
          value: content.value,
          label: content.label,
          description: content.description,
        });

      case "stat-group":
        return toSection(`${BASE}/StatGroup.tsx`, {
          stats: content.stats,
        });

      case "card-group":
        return toSection(`${BASE}/CardGroup.tsx`, {
          cards: content.cards,
        });

      case "comparison":
        return toSection(`${BASE}/Comparison.tsx`, {
          left: content.left,
          right: content.right,
        });

      case "table":
        return toSection(`${BASE}/Table.tsx`, {
          headers: content.headers,
          rows: content.rows,
        });

      case "image":
        return toSection(`${BASE}/BlockImage.tsx`, {
          url: content.url,
          mobileUrl: content.mobileUrl,
          alt: content.alt,
          caption: content.caption,
          size: content.size,
        });

      case "video":
        return toSection(`${BASE}/Video.tsx`, {
          url: content.url,
          caption: content.caption,
        });

      case "code":
        return toSection(`${BASE}/Code.tsx`, {
          code: content.code,
          language: content.language,
          filename: content.filename,
        });

      case "cta":
        return toSection(`${BASE}/Cta.tsx`, {
          text: content.text,
          href: content.href,
        });

      case "faq":
        return toSection(`${BASE}/FAQ.tsx`, {
          title: content.title,
          faqId: content.faqId,
          items: toFaqItems(content.items),
        });

      default:
        return null;
    }
  }

  // System blocks (no explicit type) — render as paragraph if they have html/text
  if ("system_block_id" in block) {
    if (content.html) {
      return toSection(`${BASE}/Paragraph.tsx`, {
        html: content.html as string,
      });
    }
    if (content.text) {
      return toSection(`${BASE}/Paragraph.tsx`, {
        text: content.text as string,
      });
    }
  }

  return null;
}
