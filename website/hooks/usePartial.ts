import { CLIENT_NAV_ATTR, PARTIAL_ATTR } from "$fresh/src/constants.ts";
import { ComponentType } from "preact";

export const SECTION_LINK_ID_SEARCH_PARAM = "section-partial-id";
export const SECTION_LINK_PROPS_SEARCH_PARAM = "section-partial-props";

type Options<P> = {
  /** Section id */
  id?: string;
  /** Section props partially applied */
  props?: Partial<P extends ComponentType<infer K> ? K : P>;
  /** Path where section is to be found */
  href?: string | URL;
};

export const usePartial = <P>({ id, props, href }: Options<P>) => {
  const maybeUrl = href ? new URL(href) : null;
  const pathname = maybeUrl?.pathname || "";

  const params = new URLSearchParams(maybeUrl?.searchParams);

  if (id) {
    params.set(SECTION_LINK_ID_SEARCH_PARAM, id);
  }

  if (props) {
    params.set(SECTION_LINK_PROPS_SEARCH_PARAM, btoa(JSON.stringify(props)));
  }

  return {
    [CLIENT_NAV_ATTR]: true,
    [PARTIAL_ATTR]: `${pathname}?${params}`,
  };
};
