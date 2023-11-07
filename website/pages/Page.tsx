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
import { Page } from "deco/blocks/page.tsx";
import { Component } from "preact";
import { ComponentFunc } from "deco/engine/block.ts";
import { HttpError } from "deco/engine/errors.ts";
import { logger } from "deco/observability/otel/config.ts";
import { notUndefined } from "deco/engine/core/utils.ts";

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

class ErrorBoundary
  extends Component<{ fallback: ComponentFunc<HTMLElement> }> {
  state = { error: null };

  // deno-lint-ignore no-explicit-any
  static getDerivedStateFromError(error: any) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const err = this?.state?.error as Error;
      const msg = `rendering: ${this.props} ${err?.stack}`;
      logger.error(
        msg,
      );
      console.error(
        msg,
      );
    }
    return this.state.error
      ? this.props.fallback(this.state.error)
      : this.props.children;
  }
}

/**
 * @title Page
 */

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
function Page(
  { sections, errorPage }: Props & { errorPage?: Page },
): JSX.Element {
  const site = { id: context.siteId, name: context.site };
  const deco = useDeco();

  return (
    <ErrorBoundary
      fallback={(error) => (
        error instanceof HttpError
          ? (
            <div>
              {errorPage === undefined ? <div></div> : <>{(errorPage?.props?.sections ?? []).filter(notUndefined).map(renderSection)}</>}
            </div>
          )
          : (
            <div>
              {error instanceof Error ? error.message : ""}
            </div>
          )
      )}
    >
      <LiveControls site={site} {...deco} />
      <Events deco={deco} />
      {sections.map(renderSection)}
    </ErrorBoundary>
  );
}

export const loader = (
  { sections }: Props,
  _req: Request,
  ctx: AppContext,
) => {
  return { sections, errorPage: ctx.errorPage };
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
