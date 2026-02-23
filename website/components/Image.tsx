import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import type { JSX } from "preact";
import { forwardRef } from "preact/compat";
import { Manifest } from "../manifest.gen.ts";

export const PATH: `/live/invoke/${keyof Manifest["loaders"]}` =
  "/live/invoke/website/loaders/image.ts";
const ASSET_URLS_TO_REPLACE = [
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

// Default is true
const isAzionAssetsEnabled = () =>
  IS_BROWSER
    // deno-lint-ignore no-explicit-any
    ? (globalThis as any).DECO?.featureFlags?.azionAssets
    : Deno.env.get("ENABLE_AZION_ASSETS") !== "false";

// Default is false
const bypassDecoImageOptimization = () =>
  IS_BROWSER
    // deno-lint-ignore no-explicit-any
    ? (globalThis as any).DECO?.featureFlags?.bypassDecoImageOptimization
    : Deno.env.get("BYPASS_DECO_IMAGE_OPTIMIZATION") === "true";

const canShowWarning = () =>
  IS_BROWSER ? false : !Deno.env.get("DENO_DEPLOYMENT_ID");

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
  console.log(
    "bypassPlatformImageOptimization",
    bypassPlatformImageOptimization(),
  );
  if (!bypassPlatformImageOptimization()) {
    console.log("originalSrc", originalSrc);
    if (originalSrc.startsWith("https://media-storage.soureicdn.com")) {
      console.log("optimizeSourei");
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

    if (
      canShowWarning() &&
      !originalSrc.startsWith(
        "https://ozksgdmyrqcxcwhnbepg.supabase.co/storage",
      )
    ) {
      console.warn(
        `The following image ${originalSrc} requires automatic image optimization, but it's currently disabled. This may incur in additional costs. Please contact deco.cx for more information.`,
      );
    }
  }

  if (bypassDecoImageOptimization()) {
    return originalSrc;
  }

  const params = new URLSearchParams();

  params.set("fit", fit);
  params.set("width", `${width}`);
  height && params.set("height", `${height}`);

  if (isAzionAssetsEnabled()) {
    // only accepted for Azion for now
    quality && params.set("quality", quality);

    const originalSrc = ASSET_URLS_TO_REPLACE.reduce(
      (acc, url) => acc.replace(url, ""),
      opts.originalSrc,
    );
    const imageSource = originalSrc.split("?")[0];
    // src is being passed separately to avoid URL encoding issues
    return `https://deco-assets.edgedeco.com/image?${params}&src=${imageSource}`;
  }

  params.set("src", originalSrc);

  return `${PATH}?${params}`;
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
