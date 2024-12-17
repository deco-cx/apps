import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { BlogPostListingPage } from "../../types.ts";

/**
 * @title Extend your Blogpost Listing Page
 */
export default function ProductDetailsExt(
  props: Props<BlogPostListingPage | null>,
): Promise<BlogPostListingPage | null> {
  return extend(props);
}

export const cache = "no-cache";
