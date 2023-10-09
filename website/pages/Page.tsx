import { Head, Partial } from "$fresh/runtime.ts";
import { PARTIAL_SEARCH_PARAM } from "$fresh/src/constants.ts";
import { Section } from "deco/blocks/section.ts";
import { ComponentMetadata } from "deco/engine/block.ts";
import { context } from "deco/live.ts";
import { isDeferred, SectionProps } from "deco/mod.ts";
import {
  usePageContext as useDecoPageContext,
  useRouterContext,
} from "deco/routes/[...catchall].tsx";
import { createContext, JSX } from "preact";
import { useContext } from "preact/hooks";
import {
  SECTION_LINK_ID_SEARCH_PARAM,
  SECTION_LINK_PROPS_SEARCH_PARAM,
} from "../hooks/usePartial.ts";
import LiveControls from "../components/_Controls.tsx";

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

function renderSectionFor(isPreview: boolean) {
  return function _renderSection(section: Props["sections"][number] | null) {
    if (!section) {
      return null;
    }

    const { Component, props, props: { id }, metadata } = section;

    return (
      <Partial name={id}>
        <section
          id={id}
          data-manifest-key={metadata?.component}
          data-resolve-chain={isPreview === true
            ? JSON.stringify(metadata?.resolveChain)
            : undefined}
        >
          <Component {...props} />
        </section>
      </Partial>
    );
  };
}

const renderSections = (
  { sections }: SectionProps<typeof loader>,
  isPreview = false,
): JSX.Element => (
  <>
    {sections.map(renderSectionFor(isPreview))}
  </>
);

interface LivePageContext {
  renderSection: ReturnType<typeof renderSectionFor>;
}

const PageContext = createContext<LivePageContext>({
  renderSection: renderSectionFor(false),
});

export const usePageContext = () => useContext(PageContext);

/**
 * @title Page
 */
function Page(
  props: SectionProps<typeof loader>,
): JSX.Element {
  const metadata = useDecoPageContext()?.metadata;
  const routerCtx = useRouterContext();
  const pageId = pageIdFromMetadata(metadata);

  return (
    <>
      <LiveControls
        site={{ id: context.siteId, name: context.site }}
        page={{ id: pageId, pathTemplate: routerCtx?.pagePath }}
        flags={routerCtx?.flags}
      />
      {renderSections(props, false)}
    </>
  );
}

export function Preview(
  props: SectionProps<typeof loader>,
) {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      {renderSections(props, true)}
    </>
  );
}

export const onBeforeResolveProps = (props: Props) => ({
  ...props,
  sections: Array.isArray(props.sections)
    ? props.sections.map((section) => ({
      data: section,
      deferred: true,
      __resolveType: "resolved",
    }))
    : props.sections,
});

export const loader = async (props: Props, req: Request) => {
  const url = new URL(req.url);
  const partialId = url.searchParams.get(SECTION_LINK_ID_SEARCH_PARAM);
  const partialProps = url.searchParams.get(SECTION_LINK_PROPS_SEARCH_PARAM);
  const paramProps = partialProps && JSON.parse(atob(partialProps));

  const sections = await Promise.all(
    props.sections.map(async (section, index) => {
      const id = `section-${index}`;

      if (partialId && partialId !== id) {
        return null;
      }

      const resolved = isDeferred<Section>(section) ? await section() : section;

      const props = {
        ...resolved.props,
        ...paramProps,
        id,
      };

      return { ...resolved, props };
    }),
  ) as Sections;

  return ({
    ...props,
    sections,
  });
};

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
