import type { SiteNavigationElement } from "../types.ts";

export interface Props {
  items?: SiteNavigationElement[];
}

const loader = ({ items }: Props): SiteNavigationElement[] | null =>
  items ?? null;

export const cache = "no-cache";

export default loader;
