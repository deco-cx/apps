import { PARTIAL_ATTR } from "$fresh/src/constants.ts";
import type { Section, SectionProps } from "deco/blocks/section.ts";
import { usePartial } from "../../hooks/usePartial.ts";

/** @titleBy type */
interface Scroll {
  type: "scroll";
  /**
   * @title Delay MS
   * @description Delay (in milliseconds) to wait after the scroll event is fired
   */
  payload: number;
}

/** @titleBy type */
interface Intersection {
  type: "intersection";
  /**
   * @title Root Margin
   * @description Margin (in pixels) to trigger deferred sections rendering
   */
  payload: string;
}

export interface Props {
  sections: Section[];
  display?: boolean;
  behavior?: Scroll | Intersection;
  id?: string;
}

const script = (
  id: string,
  type: "scroll" | "intersection",
  payload: string,
) => {
  const handler = () => {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    if (type === "scroll") {
      addEventListener(
        "scroll",
        () => setTimeout(() => element.click(), Number(payload) || 200),
      );
    }

    if (type === "intersection") {
      new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // @ts-expect-error trustme, I'm an engineer
            entry.target.click();
          }
        }
      }, { rootMargin: payload || "200px" }).observe(element);
    }
  };

  if (document.readyState === "complete") {
    handler();
  } else {
    addEventListener("load", handler);
  }
};

const ID = "deferred";

const Deferred = (props: SectionProps<typeof loader>) => {
  const { sections, display, behavior, id, href } = props;
  const partial = usePartial<typeof Deferred>({
    id,
    href,
    props: { display: true },
  });
  const buttonId = `${ID}-${id}`;

  if (display) {
    return (
      <>
        {sections.map(({ Component, props }) => <Component {...props} />)}
      </>
    );
  }

  return (
    <>
      <button {...partial} id={buttonId} data-deferred />
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `(${script})("${buttonId}", "${
            behavior?.type || "intersection"
          }", "${behavior?.payload || ""}");`,
        }}
      />
    </>
  );
};

export const loader = (props: Props, req: Request) => {
  return {
    ...props,
    href: req.url,
  };
};

export default Deferred;
