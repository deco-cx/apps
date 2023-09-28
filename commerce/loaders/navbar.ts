import type { NavItem } from "../types.ts";

export interface Props {
  items?: NavItem[];
}

const loader = ({ items }: Props): NavItem[] | null => items ?? null;

export default loader;
