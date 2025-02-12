import { shouldForceRender } from "../../utils/deferred.ts";
import { AppContext } from "../mod.ts";
import { type Section } from "@deco/deco/blocks";
import { useSection } from "@deco/deco/hooks";
import { asResolved, isDeferred } from "@deco/deco";
/**
 * @titleBy type
 * @description fires once when the element is first loaded
 */
interface Load {
  type: "load";
  /** @hide true */
  delay?: number;
}
/**
 * @titleBy type
 * @description fires once when an element first scrolls into the viewport
 */
interface Revealed {
  type: "revealed";
}
/**
 * @titleBy type
 * @description fires once when an element first intersects the viewport.
 */
interface Intersect {
  type: "intersect";
  /** @description a floating point number between 0.0 and 1.0, indicating what amount of intersection to fire the event on */
  threshold?: number;
}
export interface Props {
  sections: Section[];
  /** @hide true */
  fallbacks?: Section[];
  trigger?: Load | Revealed | Intersect;
  loading?: "lazy" | "eager";
}
const Deferred = (props: Props) => {
  const { sections, loading, trigger } = props;
  if (loading === "eager") {
    return (
      <>
        {sections.map((section) => <section.Component {...section.props} />)}
      </>
    );
  }
  const href = useSection<typeof Deferred>({
    props: { loading: "eager" },
  });
  const triggerList: (string | number)[] = [trigger?.type ?? "load", "once"];
  if (trigger?.type === "load" && trigger.delay !== undefined) {
    triggerList.push(`delay:${trigger.delay}ms`);
  }
  return (
    <>
      <div
        hx-get={href}
        hx-trigger={triggerList.join(" ")}
        hx-target="closest section"
        hx-swap="outerHTML"
        style={{ height: "100vh" }}
      />
      {props.fallbacks?.map((section) =>
        section ? <section.Component {...section.props} /> : null
      )}
    </>
  );
};
export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);
  const shouldRender = props.loading === "eager" ||
    shouldForceRender({ ctx, searchParams: url.searchParams });
  if (shouldRender) {
    const sections = isDeferred(props.sections)
      ? await props.sections()
      : props.sections;
    return { ...props, sections, loading: "eager" };
  }
  return { ...props, sections: [] };
};
const DEFERRED = true;
export const onBeforeResolveProps = (props: Props) => {
  return {
    ...props,
    fallback: null,
    sections: asResolved(props.sections, DEFERRED),
  };
};
export default Deferred;
