import { Head } from "$fresh/runtime.ts";
import { Section } from "deco/blocks/section.ts";
import { ComponentMetadata } from "deco/engine/block.ts";
import { context } from "deco/live.ts";
import {
  usePageContext as useDecoPageContext,
  useRouterContext,
} from "deco/routes/[...catchall].tsx";
import { JSX } from "preact";
import Events from "../components/Events.tsx";
import LiveControls from "../components/_Controls.tsx";
import { AppContext } from "../mod.ts";
// import { Page } from "deco/blocks/page.tsx";

/**
 * @title Sections
 * @label hidden
 * @changeable true
 */
export type Sections = Section[];

/**
 * @titleBy name
 * @label rootHidden
 */
export interface Props {
  name: string;
  path?: string;
  sections: Sections;
}

export function renderSection(section: Props["sections"][number]) {
  const { Component, props } = section;

  return <Component {...props} />;
}

const useDeco = () => {
  const metadata = useDecoPageContext()?.metadata;
  const routerCtx = useRouterContext();
  const pageId = pageIdFromMetadata(metadata);

  return {
    flags: routerCtx?.flags ?? [],
    page: {
      id: pageId,
      pathTemplate: routerCtx?.pagePath,
    },
  };
};

/**
 * @title Page
 */
function Page({ sections }: Props & { errorPage: string }): JSX.Element {
  const site = { id: context.siteId, name: context.site };
  const deco = useDeco();

  return (
    <>
      <LiveControls site={site} {...deco} />
      <Events deco={deco} />
      {sections.map(renderSection)}
    </>
  );
}

export const loader = (
  { sections }: Props,
  _req: Request,
  _ctx: AppContext,
) => {
  return { sections, errorPage: _ctx.errorPage };
};

export function Preview({ sections }: Props) {
  const deco = useDeco();

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Events deco={deco} />
      {sections.map(renderSection)}
    </>
  );
}

const PAGE_NOT_FOUND = -1;
export const pageIdFromMetadata = (
  metadata: ComponentMetadata | undefined,
) => {
  if (!metadata) {
    return PAGE_NOT_FOUND;
  }

  const { resolveChain, component } = metadata;
  const pageResolverIndex =
    (resolveChain.findLastIndex((chain) =>
      chain.type === "resolver" && chain.value === component
    )) || PAGE_NOT_FOUND;

  const pageParent = pageResolverIndex > 0
    ? resolveChain[pageResolverIndex - 1]
    : null;

  return pageParent?.value ?? PAGE_NOT_FOUND;
};

export default Page;
