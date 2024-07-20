import type { Section } from "deco/blocks/section.ts";
import type { AppContext } from "../../mod.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { __DECO_FBT } from "../../handlers/fresh.ts";
import { shouldForceRender } from "../../../utils/deferred.tsx";
import { RequestContext } from "deco/deco.ts";

interface Props {
  /** @label hidden */
  section: Section;
}

export const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const url = new URL(_req.url);
  const _shouldForceRender = shouldForceRender({
    ctx,
    searchParams: url.searchParams,
  });
  const shouldRender = _shouldForceRender;

  if (shouldRender) {
    const section = isDeferred<Section>(props.section)
      ? await props.section()
      : props.section;
    return { ...props, section };
  }

  const abortControler = new AbortController();
  abortControler.abort();
  const section = isDeferred<Section>(props.section)
    ? await RequestContext.bind(
      { signal: abortControler.signal },
      props.section,
    )()
    : props.section;

  return { ...props, section };
};

type SectionProps = Awaited<ReturnType<typeof loader>>;

function SingleDeferred(props: SectionProps) {
  const { section: { Component, props: componentProps } } = props;
  return <Component {...componentProps} />;
}

const DEFERRED = true;

export const onBeforeResolveProps = (props: Props) => {
  return {
    ...props,
    section: asResolved(props.section, DEFERRED),
  };
};

export default SingleDeferred;
