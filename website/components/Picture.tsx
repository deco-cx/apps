import { useContext, useMemo } from "preact/hooks";
import { forwardRef } from "preact/compat";
import { ComponentChildren, createContext, JSX } from "preact";
import { Head, IS_BROWSER } from "$fresh/runtime.ts";

import {
  FACTORS,
  getEarlyHintFromSrcProps,
  getSrcSet,
  type SetEarlyHint,
} from "./Image.tsx";

interface Context {
  preload?: boolean;
}

const Context = createContext<Context>({
  preload: false,
});

type SourceProps =
  & Omit<JSX.IntrinsicElements["source"], "width" | "height" | "preload">
  & {
    src: string;
    /** @description Improves Web Vitals (CLS|LCP) */
    width: number;
    /** @description Improves Web Vitals (CLS|LCP) */
    height?: number;
    /** @description Web Vitals (LCP). Adds a link[rel="preload"] tag in head. Use one preload per page for better performance */
    preload?: boolean;
    /** @description Improves Web Vitals (LCP). Use high for LCP image. Auto for other images */
    fetchPriority?: "high" | "low" | "auto";
    setEarlyHint?: SetEarlyHint;
  };

export const Source = forwardRef<HTMLSourceElement, SourceProps>(
  (props, ref) => {
    const { preload } = useContext(Context);

    const shouldSetEarlyHint = !!props.setEarlyHint && preload;
    const srcSet = getSrcSet(
      props.src,
      props.width,
      props.height,
      undefined,
      shouldSetEarlyHint ? FACTORS.slice(-1) : FACTORS,
    );
    const linkProps = {
      imagesrcset: srcSet,
      imagesizes: props.sizes,
      fetchpriority: props.fetchPriority,
      media: props.media,
    } as {
      imagesrcset: string | undefined;
      imagesizes: string | undefined;
      fetchpriority: "high" | "low" | "auto" | undefined;
      media: string | undefined;
    };

    if (!IS_BROWSER && shouldSetEarlyHint) {
      props.setEarlyHint!(
        getEarlyHintFromSrcProps({
          width: props.width,
          height: props.height,
          fetchpriority: props.fetchPriority,
          src: props.src,
        }),
      );
    }

    return (
      <>
        {preload && (
          <Head>
            <link
              as="image"
              rel="preload"
              href={props.src}
              {...linkProps}
            />
          </Head>
        )}
        <source
          {...props}
          data-fresh-disable-lock
          preload={undefined}
          src={undefined} // Avoid deprecated api lighthouse warning
          srcSet={srcSet}
          ref={ref}
        />
      </>
    );
  },
);

type Props = Omit<JSX.IntrinsicElements["picture"], "preload"> & {
  children: ComponentChildren;
  preload?: boolean;
};

export const Picture = forwardRef<HTMLPictureElement, Props>(
  ({ children, preload, ...props }, ref) => {
    const value = useMemo(() => ({ preload }), [preload]);

    return (
      <Context.Provider value={value}>
        <picture {...props} ref={ref}>
          {children}
        </picture>
      </Context.Provider>
    );
  },
);
