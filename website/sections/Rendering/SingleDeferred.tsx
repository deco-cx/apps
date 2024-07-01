import type { Section } from "deco/blocks/section.ts";
import PartialDefered, {
  type Props as BasePartialDeferredProps,
} from "./Deferred.tsx";
import HTMXDefered, {
  type Props as BaseHTMXDeferredProps,
} from "../../../htmx/sections/Deferred.tsx";
import type { AppContext } from "../../mod.ts";
import { asResolved } from "deco/mod.ts";
import { __DECO_FBT } from "../../handlers/fresh.ts";

type DeferredSection = () => Promise<Section>;

type PartialDeferredProps = Omit<BasePartialDeferredProps, "sections">;
type HTMXDeferredProps = Omit<BaseHTMXDeferredProps, "sections">;

const isPartial = (
  props: SectionProps,
): props is PartialDeferredProps & { framework: "fresh"; section: Section } =>
  props.framework === "fresh";

const isHtmx = (
  props: SectionProps,
): props is HTMXDeferredProps & { framework: "htmx"; section: Section } =>
  props.framework === "htmx";

interface Props extends HTMXDeferredProps, PartialDeferredProps {
  section: Section;
}

export const loader = async (props: Props, _req: Request, ctx: AppContext) => {
  const isPartialDisplayTrue = "display" in props && props.display === true;
  const isHtmx = "loading" in props && props.loading === "eager";
  const url = new URL(_req.url);
  const disableFBT = url.searchParams.get(__DECO_FBT) === "0";
  const disableDefer = isPartialDisplayTrue || isHtmx || disableFBT ||
    ctx.isBot;
  const framework = ctx.flavor?.framework || "fresh";

  if (disableDefer) {
    const section =
      await (props.section as unknown as DeferredSection | undefined)?.() ??
        null;
    return { ...props, framework, section };
  }

  return { ...props, framework, section: null };
};

type SectionProps = Awaited<ReturnType<typeof loader>>;

function SingleDeferred(props: SectionProps) {
  if (isHtmx(props)) {
    return (
      <HTMXDefered
        {...props}
        sections={props.section ? [props.section] : []}
        loading={props.section ? "eager" : props.loading}
      />
    );
  }

  return (
    <PartialDefered
      {...props}
      sections={props.section ? [props.section] : []}
      display={props.section
        ? true
        : isPartial(props)
        ? props.display
        : undefined}
    />
  );
}

const DEFERRED = true;

export const onBeforeResolveProps = (props: Props) => {
  return { ...props, section: asResolved(props.section, DEFERRED) };
};

export default SingleDeferred;
