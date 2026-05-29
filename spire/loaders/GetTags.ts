import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { Category, SpireTagWithCount } from "../types.ts";

/**
 * @title Get Tags
 * @description Retrieves all tags from a Spire blog as blog categories.
 */
export const cache = {
  maxAge: 60, // 1 minute — near-real-time for Spire publish
};

export const cacheKey = (
  _props: Record<never, never>,
  _req: Request,
  ctx: AppContext,
) => `spire-tags-${ctx.account}`;

export default async function GetTags(
  _props: Record<never, never>,
  _req: Request,
  ctx: AppContext,
): Promise<Category[]> {
  const { account, api } = ctx;

  try {
    const response = await api["GET /blog/:account/tags"]({ account });

    if (!response.ok) {
      logger.error(
        `GetTags: fetch failed for account "${account}" — ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const { tags } = await response.json();
    return (tags ?? []).map(spireTagToCategory);
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export function spireTagToCategory(t: SpireTagWithCount): Category {
  return { name: t.name, slug: t.slug };
}
