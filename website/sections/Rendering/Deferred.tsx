import type { Section } from "deco/blocks/section.ts";
import { usePartial } from "../../hooks/usePartial.ts";

type Scroll = {
  type: "scroll";
  /**
   * @title Delay MS
   * @description Delay (in milliseconds) to wait after the scroll event is fired
   */
  payload: number;
};

type Intersection = {
  type: "intersection";
  /**
   * @title Root Margin
   * @description Margin (in pixels) to trigger deferred sections rendering
   */
  payload: string;
};

export interface Props {
  sections: Section[];
  display?: boolean;
  behavior?: Scroll | Intersection;
}

const script = (
  id: string,
  type: "scroll" | "intersection",
  payload: string,
) => {
  const handler = () => {
    const element = document.getElementById(id);

    if (type === "scroll" && element) {
      addEventListener(
        "scroll",
        () => setTimeout(() => element.click(), Number(payload) || 200),
      );
    }

    if (type === "intersection" && element) {
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

const Deferred = (p: Props) => {
  const { sections, display, behavior } = p;
  const partial = usePartial<typeof Deferred>({
    ...p,
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
    <>
      <button id={ID} {...partial} />
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `(${script})("${ID}", "${
            behavior?.type || "intersection"
          }", "${behavior?.payload || ""}");`,
        }}
      />
    </>
  );
};

export default Deferred;
