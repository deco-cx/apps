import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { forwardRef } from "preact/compat";
import { Manifest } from "../manifest.gen.ts";

export const PATH: `/live/invoke/${keyof Manifest["loaders"]}` =
  "/live/invoke/website/loaders/image.ts";

export type Props =
  & Omit<
    JSX.IntrinsicElements["img"],
    "width" | "height" | "preload"
  >
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
    /** @description Object-fit */
    fit?: FitOptions;
  };

const FACTORS = [1, 2];

type FitOptions = "contain" | "cover";

const isImageOptmizationEnabled = () =>
  IS_BROWSER
    // deno-lint-ignore no-explicit-any
    ? (globalThis as any).DECO?.featureFlags?.enableImageOptimization
    : Deno.env.get("ENABLE_IMAGE_OPTIMIZATION") !== "false";

interface OptimizationOptions {
  originalSrc: string;
  width: number;
  height?: number;
  factor: number;
  fit: FitOptions;
}

const optmizeVNDA = (opts: OptimizationOptions) => {
  const { width, height, originalSrc } = opts;
  const src = new URL(originalSrc);

  const [replaceStr] = /\/\d*x\d*/g.exec(src.pathname) ?? [""];
  const pathname = src.pathname.replace(replaceStr, "");

  const url = new URL(
    `/${width}x${height}${pathname}${src.search}`,
    src.origin,
  );

  return url.href;
};

const optmizeShopify = (opts: OptimizationOptions) => {
  const { originalSrc, width, height } = opts;

  const url = new URL(originalSrc);
  url.searchParams.set("width", `${width}`);
  url.searchParams.set("height", `${height}`);
  url.searchParams.set("crop", "center");

  return url.href;
};

const optimizeVTEX = (opts: OptimizationOptions) => {
  const { originalSrc, width, height } = opts;

  const src = new URL(originalSrc);

  const [slash, arquivos, ids, rawId, ...rest] = src.pathname.split("/");
  const [trueId, _w, _h] = rawId.split("-");

  src.pathname = [slash, arquivos, ids, `${trueId}-${width}-${height}`, ...rest]
    .join("/");

  return src.href;
};

export const getOptimizedMediaUrl = (opts: OptimizationOptions) => {
  const { originalSrc, width, height, fit } = opts;

  if (originalSrc.startsWith("data:")) {
    return originalSrc;
  }

  if (!isImageOptmizationEnabled()) {
    if (originalSrc.startsWith("https://cdn.vnda.")) {
      return optmizeVNDA(opts);
    }

    if (originalSrc.startsWith("https://cdn.shopify.com")) {
      return optmizeShopify(opts);
    }

    if (
      /(vteximg.com.br|vtexassets.com)\/arquivos\/ids\/\d+/.test(originalSrc)
    ) {
      return optimizeVTEX(opts);
    }

    if (
      !originalSrc.startsWith(
        "https://ozksgdmyrqcxcwhnbepg.supabase.co/storage",
      )
    ) {
      console.warn(
        `The following image ${originalSrc} requires automatic image optimization, but it's currently disabled. This may incur in additional costs. Please contact deco.cx for more information.`,
      );
    }
  }

  const params = new URLSearchParams();

  params.set("src", originalSrc);
  params.set("fit", fit);
  params.set("width", `${width}`);
  height && params.set("height", `${height}`);

  return `${PATH}?${params}`;
};

export const getSrcSet = (
  originalSrc: string,
  width: number,
  height?: number,
  fit?: FitOptions,
) => {
  const srcSet = [];

  for (let it = 0; it < FACTORS.length; it++) {
    const factor = FACTORS[it];
    const w = Math.trunc(factor * width);
    const h = height && Math.trunc(factor * height);

    const src = getOptimizedMediaUrl({
      originalSrc,
      width: w,
      height: h,
      factor,
      fit: fit || "cover",
    });

    if (src) {
      srcSet.push(`${src} ${w}w`);
    }
  }

  return srcSet.length > 0 ? srcSet.join(", ") : undefined;
};

const Image = forwardRef<HTMLImageElement, Props>((props, ref) => {
  const { preload, loading = "lazy" } = props;

  if (!props.height) {
    console.warn(
      `Missing height. This image will NOT be optimized: ${props.src}`,
    );
  }

  const srcSet = getSrcSet(props.src, props.width, props.height, props.fit);
  const linkProps = srcSet && {
    imagesrcset: srcSet,
    imagesizes: props.sizes,
    fetchpriority: props.fetchPriority,
    media: props.media,
  };

  return (
    <>
      {preload && (
        <Head>
          <link as="image" rel="preload" href={props.src} {...linkProps} />
        </Head>
      )}
      <img
        {...props}
        data-fresh-disable-lock={true}
        preload={undefined}
        src={props.src}
        srcSet={srcSet}
        loading={loading}
        ref={ref}
      />
    </>
  );
});

export default Image;
