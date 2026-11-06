/** Query parameter that opens a post page in draft preview. */
export const DRAFT_PREVIEW_PARAM = "draft";

/**
 * Whether the page was opened as a draft preview (`?draft=true`).
 *
 * A post that isn't live (a draft, a post still being generated, a scheduled
 * post whose instant hasn't arrived) only renders on its own page in a
 * preview; anywhere else the page answers as if the post didn't exist. Only the
 * literal `true` turns it on: any other value, or none, is the live site.
 */
export const isDraftPreview = (url: URL): boolean =>
  url.searchParams.get(DRAFT_PREVIEW_PARAM) === "true";
