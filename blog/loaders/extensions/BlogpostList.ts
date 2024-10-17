import {
  default as extend,
  Props,
} from "../../../website/loaders/extension.ts";
import { BlogPost } from "../../types.ts";

/**
 * @title Extend your Blogpost List
 */
export default function ProductDetailsExt(
  props: Props<BlogPost[] | null>,
): Promise<BlogPost[] | null> {
  return extend(props);
}

export const cache = "no-cache";
