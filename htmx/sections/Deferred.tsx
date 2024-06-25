import type { Section } from "deco/blocks/section.ts";
import { useSection } from "deco/hooks/useSection.ts";

/**
 * @titleBy type
 * @description fires once when the element is first loaded
 */
interface Load {
  type: "load";
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
  trigger?: Load | Revealed | Intersect;
  loading?: "lazy" | "eager";
}

const Deferred = (props: Props) => {
  const { sections, loading, trigger } = props;

  if (loading === "eager") {
    return (
      <>
        {sections.map(({ Component, props }) => <Component {...props} />)}
      </>
    );
  }

  const href = useSection<typeof Deferred>({
    props: { loading: "eager" },
  });

  return (
    <div
      hx-get={href}
      hx-trigger={`${trigger?.type ?? "load"} once`}
      hx-target="closest section"
      hx-swap="outerHTML"
      style={{ height: "100vh" }}
    />
  );
};

export const onBeforeResolveProps = (props: Props) => {
  if (props.loading === "lazy") {
    return {
      ...props,
      sections: [],
    };
  }

  return props;
};

export default Deferred;
