import { BlogPost } from "../types.ts";

/**
 * @title Blogpost
 * @description Defines a blog post. All fields are editable in Studio.
 *   Posts synced from Spire include a hidden `spirePostId` field so that
 *   Spire remains the source of truth for those entries.
 */
const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
