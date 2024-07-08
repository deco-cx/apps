import type { Section } from "deco/blocks/section.ts";
import PartialDefered from "./Deferred.tsx";
import HTMXDefered from "../../../htmx/sections/Deferred.tsx";
import type { AppContext } from "../../mod.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { __DECO_FBT } from "../../handlers/fresh.ts";

const isHtmx = (
  props: SectionProps,
): props is SectionProps & { framework: "htmx" } => props.framework === "htmx";

type Trigger = "load" | "intersect";
interface Props {
  section: Section;
  trigger?: Trigger;
}

export const loader = async (props: Props, _req: Request, ctx: AppContext) => {
  const isPartialDisplayTrue = "display" in props && props.display === true;
  const isHtmx = "loading" in props && props.loading === "eager";
  const url = new URL(_req.url);
  const disableFBT = url.searchParams.get(__DECO_FBT) === "0";
  const disableDefer = isPartialDisplayTrue || isHtmx || disableFBT ||
    ctx.isBot;
  const framework = ctx.flavor?.framework || "fresh";

  if (disableDefer && isDeferred(props.section)) {
    const section = await props.section() as Section | null;
    return { ...props, framework, section };
  }

  return { ...props, framework, section: null };
};

type SectionProps = Awaited<ReturnType<typeof loader>>;

function SingleDeferred(props: SectionProps) {
  if (isHtmx(props)) {
    return (
      <HTMXDefered
        sections={props.section ? [props.section] : []}
        loading={props.section ? "eager" : "lazy"}
        trigger={{
          type: "load",
        }}
      />
    );
  }

  return (
    <PartialDefered
      sections={props.section ? [props.section] : []}
      display={props.section ? true : false}
      behavior={{
        type: "scroll",
        payload: 0,
      }}
    />
  );
}

const DEFERRED = true;

export const onBeforeResolveProps = (props: Props) => {
  return { ...props, section: asResolved(props.section, DEFERRED) };
};

export default SingleDeferred;
