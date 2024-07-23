import type { Section } from "deco/blocks/section.ts";
import { RequestContext } from "deco/deco.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { shouldForceRender } from "../../../utils/deferred.tsx";
import type { AppContext } from "../../mod.ts";
import { renderSection } from "../../pages/Page.tsx";

interface Props {
  /** @label hidden */
  section: Section;
  /**
   * @description fresh/Deferred.tsx props
   * @hide true
   */
  display?: boolean;
  /**
   * @description htmx/Deferred.tsx prop
   * @hide true
   */
  loading?: "eager";
}

export const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const isLoadingEager = "loading" in props && props.loading === "eager";
  const url = new URL(_req.url);
  const _shouldForceRender = shouldForceRender({
    ctx,
    searchParams: url.searchParams,
  });
  const shouldRender = isLoadingEager ||
    _shouldForceRender;

  if (shouldRender) {
    const section = isDeferred<Section>(props.section)
      ? await props.section()
      : props.section;
    return section;
  }

  // How to improve it
  const abortControler = new AbortController();
  abortControler.abort();
  const section = isDeferred<Section>(props.section)
    ? await RequestContext.bind(
      { signal: abortControler.signal },
      props.section,
    )({}, {
      propagateOptions: true,
      hooks: {
        onPropsResolveStart: (
          resolve,
          _props,
          resolver,
        ) => {
          let next = resolve;
          if (resolver?.type === "matchers") { // matchers should not have a timeout.
            next = RequestContext.bind(
              { signal: _req.signal },
              resolve,
            );
          }
          return next();
        },
      },
    })
    : props.section;

  return {
    Component: section.LoadingFallback ??
      (() => <div style={{ height: "50vh" }}></div>),
    props: {},
    metadata: section.metadata,
  } as Section;
};

function SingleDeferred(section: Section) {
  return renderSection(section);
}

export const onBeforeResolveProps = (props: Props) => {
  return {
    ...props,
    section: asResolved(props.section, true),
  };
};

export default SingleDeferred;
