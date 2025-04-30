import { AppContext } from "../mod.ts";
import { ISearchParams, ISearchResult } from "../client.ts";

/**
 * Builds a Google search query string with advanced operators
 * @param params - Search parameters including advanced operators
 * @returns Complete query string with operators
 * @private
 */
function buildAdvancedQuery(params: ISearchParams): string {
  // Normalize spaces in the query
  let query = params.q.trim().replace(/\s+/g, " ");

  // Add site restriction
  if (params.site) {
    query += ` site:${params.site}`;
  }

  // Add file type filter
  if (params.filetype) {
    query += ` filetype:${params.filetype}`;
  }

  // Add URL word search
  if (params.inurl) {
    query += ` inurl:${params.inurl}`;
  }

  // Add title word search
  if (params.intitle) {
    query += ` intitle:${params.intitle}`;
  }

  // Add related sites search
  if (params.related) {
    query += ` related:${params.related}`;
  }

  // Add cached page view
  if (params.cache) {
    query += ` cache:${params.cache}`;
  }

  // Add date range filters
  if (params.before) {
    query += ` before:${params.before}`;
  }
  if (params.after) {
    query += ` after:${params.after}`;
  }

  // Add exact phrase match
  if (params.exact) {
    query += ` "${params.exact}"`;
  }

  // Add excluded terms
  if (params.exclude) {
    query += params.exclude.split(",").map((term) => ` -${term.trim()}`).join(
      "",
    );
  }

  // Add OR terms
  if (params.or) {
    query += ` (${
      params.or.split(",").map((term) => term.trim()).join(" OR ")
    })`;
  }

  return query.trim();
}

/**
 * @title Advanced Search
 * @description Perform a web search with advanced operators using Serper API
 */
export default async function advancedSearch(
  props: ISearchParams,
  _req: Request,
  ctx: AppContext,
): Promise<ISearchResult> {
  // Build the advanced query string with operators
  const enhancedQuery = buildAdvancedQuery(props);

  // Create a new params object with the enhanced query
  const searchParams = {
    ...props,
    q: enhancedQuery,
  };

  const response = await ctx.searchApi["POST /search"]({}, {
    body: searchParams,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Serper API error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return await response.json();
}
