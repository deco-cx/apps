import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { BlogPostPage } from "../../types.ts";

/**
 * @title Extend your Blogpost Page
 */
export default function ProductDetailsExt(
  props: Props<BlogPostPage | null>,
): Promise<BlogPostPage | null> {
  return extend(props);
}

export const cache = "no-cache";
