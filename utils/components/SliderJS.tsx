import { scriptAsDataURI } from "../dataURI.ts";

export interface Props {
  rootId: string;
  scroll?: "smooth" | "auto";
  interval?: number;
  infinite?: boolean;
}

const snippet = (
  rootId: string,
  scroll: "smooth" | "auto",
  interval?: number,
  infinite?: boolean,
) => {
  // Percentage of the item that has to be inside the container
  // for it it be considered as inside the container
  const SLIDER_THRESHOLD = 0.6;

  const intersectionX = (element: DOMRect, container: DOMRect): number => {
    const delta = container.width / 1_000;

    if (element.right < container.left - delta) {
      return 0.0;
    }

    if (element.left > container.right + delta) {
      return 0.0;
    }

    if (element.left < container.left - delta) {
      return element.right - container.left + delta;
    }

    if (element.right > container.right + delta) {
      return container.right - element.left + delta;
    }

    return element.width;
  };

  // as any are ok in typeguard functions
  const isHTMLElement = (x: Element): x is HTMLElement =>
    // deno-lint-ignore no-explicit-any
    typeof (x as any).offsetLeft === "number";

  const setup = ({ rootId, scroll, interval, infinite }: Props) => {
    const root = document.getElementById(rootId);
    const slider = root?.querySelector<HTMLElement>("[data-slider]");
    const items = root?.querySelectorAll<HTMLElement>("[data-slider-item]");
    const prev = root?.querySelector<HTMLElement>('[data-slide="prev"]');
    const next = root?.querySelector<HTMLElement>('[data-slide="next"]');
    const dots = root?.querySelectorAll<HTMLElement>("[data-dot]");

    if (!root || !slider || !items || items.length === 0) {
      console.warn(
        "Missing necessary slider attributes. It will not work as intended. Necessary elements:",
        { root, slider, items, rootId },
      );

      return;
    }

    const getElementsInsideContainer = () => {
      const indices = [];
      const sliderRect = slider.getBoundingClientRect();

      for (let index = 0; index < items.length; index++) {
        const item = items.item(index);
        const rect = item.getBoundingClientRect();

        const ratio = intersectionX(rect, sliderRect) / rect.width;

        if (ratio > SLIDER_THRESHOLD) {
          indices.push(index);
        }
      }

      return indices;
    };

    const goToItem = (index: number) => {
      const item = items.item(index);

      if (!isHTMLElement(item)) {
        return;
      }

      slider.scrollTo({
        top: 0,
        behavior: scroll,
        left: item.offsetLeft - root.offsetLeft,
      });
    };

    const onClickPrev = () => {
      const indices = getElementsInsideContainer();
      // Wow! items per page is how many elements are being displayed inside the container!!
      const itemsPerPage = indices.length;

      const isShowingFirst = indices[0] === 0;
      const pageIndex = Math.floor(
        indices[indices.length - 1] / itemsPerPage,
      );

      goToItem(
        isShowingFirst ? items.length - 1 : (pageIndex - 1) * itemsPerPage,
      );
    };

    const onClickNext = () => {
      const indices = getElementsInsideContainer();
      // Wow! items per page is how many elements are being displayed inside the container!!
      const itemsPerPage = indices.length;

      const isShowingLast = indices[indices.length - 1] === items.length - 1;
      const pageIndex = Math.floor(indices[0] / itemsPerPage);

      goToItem(isShowingLast ? 0 : (pageIndex + 1) * itemsPerPage);
    };

    const observer = new IntersectionObserver(
      (elements) =>
        elements.forEach((item) => {
          const index = Number(item.target.getAttribute("data-slider-item")) ||
            0;
          const dot = dots?.item(index);

          if (item.isIntersecting) {
            dot?.setAttribute("disabled", "");
          } else {
            dot?.removeAttribute("disabled");
          }

          if (!infinite) {
            if (index === 0) {
              if (item.isIntersecting) {
                prev?.setAttribute("disabled", "");
              } else {
                prev?.removeAttribute("disabled");
              }
            }
            if (index === items.length - 1) {
              if (item.isIntersecting) {
                next?.setAttribute("disabled", "");
              } else {
                next?.removeAttribute("disabled");
              }
            }
          }
        }),
      { threshold: SLIDER_THRESHOLD, root: slider },
    );

    items.forEach((item) => observer.observe(item));

    for (let it = 0; it < (dots?.length ?? 0); it++) {
      dots?.item(it).addEventListener("click", () => goToItem(it));
    }

    prev?.addEventListener("click", onClickPrev);
    next?.addEventListener("click", onClickNext);

    const timeout = interval && setInterval(onClickNext, interval);

    // Unregister callbacks
    return () => {
      for (let it = 0; it < (dots?.length ?? 0); it++) {
        dots?.item(it).removeEventListener("click", () => goToItem(it));
      }

      prev?.removeEventListener("click", onClickPrev);
      next?.removeEventListener("click", onClickNext);

      observer.disconnect();

      clearInterval(timeout);
    };
  };
  setup({ rootId, scroll, interval, infinite });
};

function Slider({
  rootId,
  scroll = "smooth",
  interval,
  infinite = false,
}: Props) {
  return (
    <>
      <script
        src={scriptAsDataURI(
          snippet,
          rootId,
          scroll,
          interval,
          infinite,
        )}
      >
      </script>
    </>
  );
}

export default Slider;
