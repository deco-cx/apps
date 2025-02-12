import { useId } from "preact/hooks";
import { AppContext } from "../../mod.ts";
import { shouldForceRender } from "../../../utils/deferred.ts";
import { type Section } from "@deco/deco/blocks";
import { usePartialSection, useScriptAsDataURI } from "@deco/deco/hooks";
import { asResolved, isDeferred } from "@deco/deco";
/** @titleBy type */
export interface Scroll {
  type: "scroll";
  /**
   * @hide true
   * @title Delay MS
   * @description Delay (in milliseconds) to wait after the scroll event is fired.
   */
  payload: number;
}
interface Load {
  type: "load";
  /**
   * @hide true
   * @title Delay MS
   * @description Delay (in milliseconds) to wait after the DOMContentLoaded event is fired. If value is 0, it will trigger when page load
   */
  payload: number;
}
/** @titleBy type */
export interface Intersection {
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
  behavior?: Scroll | Intersection | Load;
}
const script = (
  id: string,
  type: "scroll" | "intersection" | "load",
  payload: string,
) => {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }
  const triggerRender = (timeout: number) => () => {
    setTimeout(() => element.click(), timeout);
  };
  if (type === "load") {
    const timeout = Number(payload || 200);
    const instant = timeout === 0;
    if (instant || document.readyState === "complete") {
      triggerRender(timeout);
    } else {
      addEventListener("DOMContentLoaded", triggerRender(timeout));
    }
  }
  if (type === "scroll") {
    addEventListener("scroll", triggerRender(Number(payload) ?? 200), {
      once: true,
    });
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
const Deferred = (props: Props) => {
  const { sections, display, behavior } = props;
  const sectionID = useId();
  const buttonId = `deffered-${sectionID}`;
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
    <>
      <button
        {...partial}
        id={buttonId}
        data-deferred
        aria-label={`Deferred Section - ${sectionID}`}
      />
      <script
        defer
        src={useScriptAsDataURI(
          script,
          buttonId,
          behavior?.type || "intersection",
          behavior?.payload.toString() || "",
        )}
      />
    </>
  );
};
export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);
  const shouldRender = props.display === true ||
    shouldForceRender({ ctx, searchParams: url.searchParams });
  if (shouldRender) {
    const sections = isDeferred(props.sections)
      ? await props.sections()
      : props.sections;
    return {
      ...props,
      display: true,
      sections,
    };
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
