import { type Section } from "@deco/deco/blocks";
import { Block } from "../types.ts";
import { Resolved } from "@deco/deco";

const BASE = "spire/sections/blocks";

function toSection(
  resolveType: string,
  props: Record<string, unknown>,
): Section {
  return { __resolveType: resolveType, ...props } as unknown as Section;
}

export function blocksToSections(
  blocks: Block[],
  overrides: Record<string, Resolved<Section>> = {},
): Section[] {
  return [...blocks]
    .sort((a, b) => a.position - b.position)
    .map((block) => blockToSection(block, overrides))
    .filter((s): s is Section => s !== null);
}

function blockToSection(
  block: Block,
  overrides: Record<string, Resolved<Section>>,
): Section | null {
  const content = block.content as Record<string, unknown>;

  if ("type" in block && block.type) {
    if (overrides[block.type]) {
      // Use the store's configured section type (__resolveType) but keep
      // props coming from the Spire API (block.content). The override exists
      // solely to remap the renderer — not to inject static props.
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

      case "image":
        return toSection(`${BASE}/BlockImage.tsx`, {
          url: content.url,
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

      default:
        return null;
    }
  }

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
    return null;
  }

  return null;
}
