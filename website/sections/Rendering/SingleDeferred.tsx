import type { Section } from "deco/blocks/section.ts";
import PartialDefered from "./Deferred.tsx";
import HTMXDefered from "../../../htmx/sections/Deferred.tsx";
import type { AppContext } from "../../mod.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { __DECO_FBT } from "../../handlers/fresh.ts";
import { shouldForceRender } from "../../../utils/deferred.ts";
import { useContext } from "preact/hooks";
import { SectionContext } from "deco/components/section.tsx";

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
  props: ReturnType<typeof onBeforeResolveProps>,
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
  const fallback = await ctx.get(props.fallback);

  return { ...props, framework, section: null, fallback };
};

type SectionProps = Awaited<ReturnType<typeof loader>> & {
  fallback: Section;
};

function SingleDeferred(props: SectionProps) {
  const ctx = useSectionContext();
  const idxOrNaN = Number(ctx?.resolveChain.at(-2)?.value);
  const delay = 25 * (Math.min(Number.isNaN(idxOrNaN) ? 1 : idxOrNaN, 10) || 1);

  if (isHtmx(props)) {
    return (
      <HTMXDefered
        sections={props.section ? [props.section] : []}
        loading={props.section ? "eager" : "lazy"}
        trigger={{
          type: "load",
          delay,
        }}
      />
    );
  }

  return (
    <PartialDefered
      sections={props.section ? [props.section] : []}
      display={props.section ? true : false}
      behavior={{
        type: "load",
        payload: delay,
      }}
      fallbacks={[props.fallback]}
    />
  );
}

const DEFERRED = true;

export const onBeforeResolveProps = (props: Props) => {
  // fazer recursivo
  const propsWithoutResolvable = Object.entries(props.section).reduce(
    (newProps, [pKey, pValue]) => {
      if (Array.isArray(pValue)) {
        const hasResolvable = pValue.some((item) =>
          typeof item === "object" && !!item.__resolveType
        );
        if (hasResolvable) return newProps;
      }
      if (typeof pValue === "object" && pValue.__resolveType) return newProps;

      newProps[pKey] = pValue;
      return newProps;
    },
    {} as Record<string, unknown>,
  );

  return {
    ...props,
    section: asResolved(props.section, DEFERRED),
    fallback: propsWithoutResolvable,
  };
};

export default SingleDeferred;
