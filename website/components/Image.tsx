import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { forwardRef } from "preact/compat";

const DEFAULT_CDN_HOST = "https://decoims.com";

// CDN host can be overridden via DECO_CDN_HOST env var (server) or
// window.DECO.featureFlags.cdnHost (browser, injected by Events.tsx).
const getCdnHost = (): string => {
  if (IS_BROWSER) {
    // deno-lint-ignore no-explicit-any
    return (globalThis as any).DECO?.featureFlags?.cdnHost ?? DEFAULT_CDN_HOST;
  }
  return Deno.env.get("DECO_CDN_HOST") ?? DEFAULT_CDN_HOST;
};

// Strip these prefixes before passing the remainder to the CDN's `?src=` so
// the worker hits GCS directly instead of doing an absolute-URL hop. The
// configured CDN host is included so a non-default DECO_CDN_HOST still
// strips correctly; the GCS deco-assets bucket is kept unconditionally as a
// well-known origin.
const getAssetUrlPrefixesToStrip = (): readonly string[] => [
  `${getCdnHost()}/`,
  "https://storage.googleapis.com/deco-assets/",
  "https://assets.decocache.com/",
  "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/",
  "https://data.decoassets.com/",
];

export type SetEarlyHint = (hint: string) => void;
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
    /** @description Quality */
    quality?: QualityOptions;
    setEarlyHint?: SetEarlyHint;
  };

export const FACTORS = [1, 2];

type FitOptions = "contain" | "cover";

// By default we use the platform image optimization, with functions like:
// optimizeVTEX, optimizeWake, optmizeShopify
// if you want to use deco optimization
// you can set the BYPASS_PLATFORM_IMAGE_OPTIMIZATION environment variable to true
// Default is false
const bypassPlatformImageOptimization = () =>
  IS_BROWSER
    // deno-lint-ignore no-explicit-any
    ? (globalThis as any).DECO?.featureFlags?.bypassPlatformImageOptimization
    : Deno.env.get("BYPASS_PLATFORM_IMAGE_OPTIMIZATION") === "true";

// Default is false
const bypassDecoImageOptimization = () =>
  IS_BROWSER
    // deno-lint-ignore no-explicit-any
    ? (globalThis as any).DECO?.featureFlags?.bypassDecoImageOptimization
    : Deno.env.get("BYPASS_DECO_IMAGE_OPTIMIZATION") === "true";

export type QualityOptions = "low" | "medium" | "high" | "original"; // 60% - 70% - 80% - 100%

interface OptimizationOptions {
  originalSrc: string;
  width: number;
  height?: number;
  factor: number;
  fit: FitOptions;
  quality?: QualityOptions;
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

  src.pathname = [
    slash,
    arquivos,
    ids,
    `${trueId}-${width}-${height}`,
    ...rest,
  ].join("/");

  return src.href;
};

const optimizeWake = (opts: OptimizationOptions) => {
  const { originalSrc, width, height } = opts;

  const url = new URL(originalSrc);
  url.searchParams.set("w", `${width}`);
  url.searchParams.set("h", `${height}`);

  return url.href;
};

const qualityToNumber = (quality: "low" | "medium" | "high" | "original") => {
  switch (quality) {
    case "low":
      return 60;
    case "medium":
      return 70;
    case "high":
      return 80;
    case "original":
      return 100;
  }
};

const optimizeSourei = (opts: OptimizationOptions) => {
  const { originalSrc, width, height, fit, quality } = opts;

  const url = new URL(originalSrc);
  url.searchParams.set("w", `${width}`);
  height && url.searchParams.set("h", `${height}`);
  fit && url.searchParams.set("fit", fit);
  quality &&
    url.searchParams.set("q", qualityToNumber(quality).toString());

  return url.href;
};

const optimizeMagento = (opts: OptimizationOptions) => {
  const { originalSrc, width, height } = opts;

  const url = new URL(originalSrc);
  url.searchParams.set("width", `${width}`);
  url.searchParams.set("height", `${height}`);
  url.searchParams.set("canvas", `${width}:${height}`);
  url.searchParams.set("optimize", "low");
  url.searchParams.set("fit", opts.fit === "cover" ? "" : "bounds");

  return url.href;
};

export const getOptimizedMediaUrl = (opts: OptimizationOptions) => {
  const { originalSrc, width, height, fit, quality } = opts;

  if (originalSrc.startsWith("data:")) {
    return originalSrc;
  }
  if (!bypassPlatformImageOptimization()) {
    if (originalSrc.startsWith("https://media-storage.soureicdn.com")) {
      return optimizeSourei(opts);
    }

    if (originalSrc.includes("media/catalog/product")) {
      return optimizeMagento(opts);
    }

    if (originalSrc.includes("fbitsstatic.net/img/")) {
      return optimizeWake(opts);
    }

    if (originalSrc.startsWith("https://cdn.vnda.")) {
      return optmizeVNDA(opts);
    }

    if (originalSrc.startsWith("https://cdn.shopify.com")) {
      return optmizeShopify(opts);
    }

    if (
      /(vteximg.com.br|vtexassets.com|myvtex.com)\/arquivos\/ids\/\d+/.test(
        originalSrc,
      )
    ) {
      return optimizeVTEX(opts);
    }
  }

  if (bypassDecoImageOptimization()) {
    return originalSrc;
  }

  const params = new URLSearchParams();

  params.set("fit", fit);
  params.set("width", `${width}`);
  height && params.set("height", `${height}`);
  quality && params.set("quality", quality);

  // Strip known CDN prefixes so the worker can hit GCS directly instead of
  // doing an absolute-URL hop. Anything left (path + any query string —
  // signed URLs, cache busters, etc.) is preserved verbatim through
  // URLSearchParams encoding and recovered on the worker via
  // searchParams.get("src").
  const src = getAssetUrlPrefixesToStrip().reduce(
    (acc, url) => acc.replace(url, ""),
    opts.originalSrc,
  );
  params.set("src", src);

  return `${getCdnHost()}/image?${params}`;
};

export const getSrcSet = (
  originalSrc: string,
  width: number,
  height?: number,
  fit?: FitOptions,
  factors: number[] = FACTORS,
  quality?: QualityOptions,
) => {
  const srcSet = [];

  for (let it = 0; it < factors.length; it++) {
    const factor = factors[it];
    const w = Math.trunc(factor * width);
    const h = height && Math.trunc(factor * height);

    const src = getOptimizedMediaUrl({
      originalSrc,
      width: w,
      height: h,
      factor,
      fit: fit || "cover",
      quality: quality,
    });

    if (src) {
      srcSet.push(`${src} ${w}w`);
    }
  }

  return srcSet.length > 0 ? srcSet.join(", ") : undefined;
};

export const getEarlyHintFromSrcProps = (srcProps: {
  fetchpriority: "high" | "low" | "auto" | undefined;
  src: string;
  fit?: FitOptions;
  width: number;
  height?: number;
  quality?: QualityOptions;
}) => {
  const factor = FACTORS.at(-1)!;
  const src = getOptimizedMediaUrl({
    originalSrc: srcProps.src,
    width: Math.trunc(srcProps.width * factor),
    height: srcProps.height && Math.trunc(srcProps.height * factor),
    fit: srcProps.fit || "cover",
    factor,
    quality: srcProps.quality,
  });
  const earlyHintParts = [
    `<${src}>`,
    `rel=preload`,
    `as=image`,
  ];

  if (srcProps?.fetchpriority) {
    earlyHintParts.push(`fetchpriority=${srcProps.fetchpriority}`);
  }

  return earlyHintParts.join("; ");
};

const Image = forwardRef<HTMLImageElement, Props>((props, ref) => {
  const { preload, loading = "lazy" } = props;

  const shouldSetEarlyHint = !!props.setEarlyHint && preload;
  const srcSet = props.srcSet ??
    getSrcSet(
      props.src,
      props.width,
      props.height,
      props.fit,
      shouldSetEarlyHint ? FACTORS.slice(-1) : FACTORS,
      props.quality,
    );

  const linkProps = srcSet &&
    ({
      imageSrcSet: srcSet,
      imageSizes: props.sizes,
      fetchPriority: props.fetchPriority,
      media: props.media,
    } as
      | ""
      | undefined
      | {
        imageSrcSet: string;
        imageSizes: string | undefined;
        fetchPriority: "high" | "low" | "auto" | undefined;
        media: string | undefined;
      });

  if (!IS_BROWSER && shouldSetEarlyHint) {
    props.setEarlyHint!(
      getEarlyHintFromSrcProps({
        width: props.width,
        height: props.height,
        fetchpriority: props.fetchPriority,
        src: props.src,
        quality: props.quality,
      }),
    );
  }

  return (
    <>
      {preload && (
        <Head>
          <link as="image" rel="preload" href={props.src} {...linkProps} />
        </Head>
      )}
      <img
        {...props}
        data-fresh-disable-lock
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
