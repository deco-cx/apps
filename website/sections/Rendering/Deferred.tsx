import type { Section } from "deco/blocks/section.ts";
import { usePartialSection } from "deco/hooks/usePartialSection.ts";
import { useScriptAsDataURI } from "deco/hooks/useScript.ts";
import { asResolved, isDeferred } from "deco/mod.ts";
import { useId } from "preact/hooks";
import { AppContext } from "../../mod.ts";
import { shouldForceRender } from "../../../utils/deferred.ts";

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
}

const script = (
  id: string,
  type: "scroll" | "intersection",
  payload: string,
) => {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  if (type === "scroll") {
    addEventListener(
      "scroll",
      () => setTimeout(() => element.click(), Number(payload) || 200),
      { once: true },
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
    sections: asResolved(props.sections, DEFERRED),
  };
};

export default Deferred;
