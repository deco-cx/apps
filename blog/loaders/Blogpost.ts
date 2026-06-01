import { BlogPost } from "../types.ts";

/**
 * @title Blogpost
 * @description Defines a native blog post. All fields are editable in Studio.
 *   For Spire-managed posts (restricted form), see SpirePost.ts.
 */
const loader = ({ post }: { post: BlogPost }): BlogPost => post;

export default loader;
