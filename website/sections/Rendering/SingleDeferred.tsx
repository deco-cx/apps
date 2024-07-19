import type { Section } from "deco/blocks/section.ts";
import PartialDeferred from "./Deferred.tsx";
import HTMXDeferred from "../../../htmx/sections/Deferred.tsx";
import type { AppContext } from "../../mod.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { __DECO_FBT } from "../../handlers/fresh.ts";
import { shouldForceRender } from "../../../utils/deferred.tsx";
import { useContext } from "preact/hooks";
import { SectionContext } from "deco/components/section.tsx";
import { RequestContext } from "deco/deco.ts";

const useSectionContext = () => useContext(SectionContext);

const isHtmx = (
  props: SectionProps,
): props is SectionProps & { framework: "htmx" } => props.framework === "htmx";

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
  const isFreshSyncRender = "display" in props && props.display === true;
  const isHtmxSyncRender = "loading" in props && props.loading === "eager";
  const url = new URL(_req.url);
  const _shouldForceRender = shouldForceRender({
    ctx,
    searchParams: url.searchParams,
  });
  const shouldRender = isFreshSyncRender || isHtmxSyncRender ||
    _shouldForceRender;
  const framework = ctx.flavor?.framework || "fresh";

  if (shouldRender) {
    const section = isDeferred<Section>(props.section)
      ? await props.section()
      : props.section;
    return { ...props, framework, section, fallback: null };
  }

  // How to improve it
  const abortControler = new AbortController();
  abortControler.abort();
  const section = isDeferred<Section>(props.section)
    ? await RequestContext.bind(
      { signal: abortControler.signal },
      props.section,
    )()
    : props.section;

  return { ...props, framework, section: null, fallback: section };
};

type SectionProps = Awaited<ReturnType<typeof loader>>;

function SingleDeferred(props: SectionProps) {
  const ctx = useSectionContext();
  const idxOrNaN = Number(ctx?.resolveChain.at(-2)?.value);
  const delay = 25 * (Math.min(Number.isNaN(idxOrNaN) ? 1 : idxOrNaN, 10) || 1);
  const sections = props.section ? [props.section] : [];
  const fallbacks = props.fallback ? [props.fallback] : undefined;

  if (isHtmx(props)) {
    return (
      <HTMXDeferred
        sections={sections}
        fallbacks={fallbacks}
        loading={props.section ? "eager" : "lazy"}
        trigger={{
          type: "load",
          delay,
        }}
      />
    );
  }

  return (
    <PartialDeferred
      sections={props.section ? [props.section] : []}
      fallbacks={props.fallback ? [props.fallback] : undefined}
      display={props.section ? true : false}
      behavior={{
        type: "load",
        payload: delay,
      }}
    />
  );
}

const DEFERRED = true;

export const onBeforeResolveProps = (props: Props) => {
  return {
    ...props,
    section: asResolved(props.section, DEFERRED),
  };
};

export default SingleDeferred;
