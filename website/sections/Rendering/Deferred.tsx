// deno-lint-ignore-file no-explicit-any
import { Partial } from "$fresh/runtime.ts";
import type { Section } from "deco/blocks/section.ts";
import type { Resolved, SectionProps } from "deco/mod.ts";
import type { JSX } from "preact";

/** @titleBy data */
interface Deferred<T> extends Resolved<T> {
  deferred: true;
}

export interface Props {
  sections: Deferred<Section>[];
  /** @default 100px */
  margin?: string;
}

const INCLUDE_PARAM = "fresh-partial";

const script = (id: string, margin: string) => {
  const handler = () => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // @ts-expect-error trustme, I'm an engineer
          entry.target.click();
        }
      }
    }, { rootMargin: margin });

    const element = document.getElementById(id);
    element && observer.observe(element);
  };

  if (document.readyState === "complete") {
    handler();
  } else {
    addEventListener("load", handler);
  }
};

type PromiseOf<T> = T extends Promise<infer K> ? K : T;

const PartialSection = (
  { sections, current, partial, margin }: SectionProps<
    PromiseOf<ReturnType<typeof loader>>
  >,
) => {
  return (
    <>
      {sections.length === 0
        ? (
          <>
            <Partial name={INCLUDE_PARAM}>
              <a fh-partial={partial} href={current} id={INCLUDE_PARAM} />
            </Partial>
            <script
              type="module"
              dangerouslySetInnerHTML={{
                __html: `(${script})("${INCLUDE_PARAM}", "${margin}");`,
              }}
            />
          </>
        )
        : (
          <Partial name={INCLUDE_PARAM}>
            {sections.map(({ Component, props }) => <Component {...props} />)}
          </Partial>
        )}
    </>
  );
};

export const loader = async (props: Props, req: Request) => {
  const currentURL = new URL(req.url);
  const partialURL = new URL(currentURL);

  const include = currentURL.searchParams.get(INCLUDE_PARAM);

  partialURL.searchParams.set(INCLUDE_PARAM, "true");

  return {
    margin: props.margin || "100px",
    current: `${currentURL.pathname}${currentURL.search}`,
    partial: `${partialURL.pathname}${partialURL.search}`,
    sections: include
      ? await Promise.all(
        props.sections.map((fn: any) => fn()) as Array<
          { Component: (props: any) => JSX.Element; props: any }
        >,
      )
      : [],
  };
};

export default PartialSection;
