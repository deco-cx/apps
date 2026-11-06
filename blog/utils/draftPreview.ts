/** Query parameter that opens a blog page in draft preview. */
export const DRAFT_PREVIEW_PARAM = "draft";

/**
 * Whether the page was opened as a draft preview (`?draft=true`).
 *
 * Listings normally keep posts that aren't live (drafts, posts still being
 * generated, scheduled posts whose instant hasn't arrived) out; a preview
 * lists them too, so an editor can see a post in place before publishing it.
 * Only the literal `true` turns it on: any other value, or none, is the live
 * site.
 */
export const isDraftPreview = (url: URL): boolean =>
  url.searchParams.get(DRAFT_PREVIEW_PARAM) === "true";
