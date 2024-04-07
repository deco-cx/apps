import { Author } from "../types.ts";

/**
 * @title Author
 * @description Defines a blog post author.
 */
const loader = ({ author }: { author: Author }): Author => author;

export default loader;
