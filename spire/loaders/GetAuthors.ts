import { logger } from "@deco/deco/o11y";
import { AppContext } from "../mod.ts";
import { Author, SpireAuthorFull } from "../types.ts";

/**
 * @title Get Authors
 * @description Retrieves all authors from a Spire blog.
 */
export const cache = {
  maxAge: 60 * 60 * 24, // 24 hours
};

export const cacheKey = (
  _props: Record<never, never>,
  _req: Request,
  ctx: AppContext,
) => `spire-authors-${ctx.account}`;

export default async function GetAuthors(
  _props: Record<never, never>,
  _req: Request,
  ctx: AppContext,
): Promise<Author[]> {
  const { account, api } = ctx;

  try {
    const response = await api["GET /blog/:account/authors"]({ account });

    if (!response.ok) {
      logger.error(
        `GetAuthors: fetch failed for account "${account}" — ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const { authors } = await response.json();
    return (authors ?? []).map(spireAuthorFullToAuthor);
  } catch (e) {
    logger.error(e);
    return [];
  }
}

export function spireAuthorFullToAuthor(a: SpireAuthorFull): Author {
  return {
    name: a.name,
    email: "",
    avatar: a.avatarUrl ?? undefined,
  };
}
