import {
  Props as LivePageProps,
  renderSection,
} from "../../../website/pages/Page.tsx";
import { type Page } from "@deco/deco/blocks";
import { notUndefined } from "@deco/deco/utils";
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
