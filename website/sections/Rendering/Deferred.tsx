import type { Section } from "deco/blocks/section.ts";
import { usePartialSection } from "deco/hooks/usePartialSection.ts";

export interface Props {
  sections: Section[];
  display?: boolean;

  /** @description Describes how the section should be lazy loaded. Either on page load, when the element is scrolled into viewport ` */
  behavior?: "load" | "revealed";

  /** @title Placeholder Height */
  height?: string;
}

const Deferred = (props: Props) => {
  const { sections, display, behavior = "load", height = "250px" } = props;
  const partial = usePartialSection<typeof Deferred>({
    props: { display: true },
  });

  if (display) {
    return (
      <>
        {sections.map(({ Component, props }) => <Component {...props} />)}
      </>
    );
  }

  return (
    <div
      hx-swap="outerHTML"
      hx-trigger={behavior}
      hx-get={partial["f-partial"]}
      class="flex justify-center items-center"
      style={{ height }}
    >
      <span class="loading loading-dots loading-lg" />
    </div>
  );
};

export default Deferred;
