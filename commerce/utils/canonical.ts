import { BreadcrumbList } from "../types.ts";

export const canonicalFromBreadcrumblist = (
  { itemListElement }: BreadcrumbList,
) =>
  itemListElement.length > 0
    ? itemListElement.reduce((acc, curr) =>
      acc.position < curr.position ? curr : acc
    ).item
    : undefined;
