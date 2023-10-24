/** TODO: Deprecate this file */
import { Page } from "deco/blocks/page.tsx";
import { notUndefined } from "deco/engine/core/utils.ts";

import {
  Props as LivePageProps,
  renderSection,
} from "../../../website/pages/Page.tsx";

export interface Props {
  page: Page;
}

export const isLivePageProps = (
  p: Page["props"] | LivePageProps,
): p is LivePageProps => {
  return (p as LivePageProps)?.sections !== undefined;
};

export default function PageInclude({ page }: Props) {
  if (!isLivePageProps(page?.props)) {
    return null;
  }

  return (
    <>{(page?.props?.sections ?? []).filter(notUndefined).map(renderSection)}</>
  );
}
