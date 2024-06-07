import type { SiteNavigationElement } from "../../commerce/types.ts";
import { Category } from "./client/types.ts";

function nodeToNavbar(node: Category): SiteNavigationElement {
  const url = new URL(node.url, "https://example.com");

  return {
    "@type": "SiteNavigationElement",
    url: `${url.pathname}${url.search}`,
    name: node.name,
    children: node.subcategories.map(nodeToNavbar),
  };
}

export const categoryTreeToNavbar = (
  tree: Category[],
): SiteNavigationElement[] => tree.map(nodeToNavbar);
