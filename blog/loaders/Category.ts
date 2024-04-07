import { Category } from "../types.ts";

/**
 * @title Category
 * @description Defines a blog post category.
 */
const loader = ({ category }: { category: Category }): Category => category;

export default loader;
