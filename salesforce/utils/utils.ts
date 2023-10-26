import { PricingRange } from "./types.ts";

export function slugfy(url: string) {
  return url
    .toString()
    .toLowerCase()
    .replace(/%20/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/_/g, "-")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export const stringfyParams = (params?: object): string => {
  if (!params || Object.keys(params).length == 0) {
    return "";
  }

  return (
    "&" +
    Object.keys(params)
      .map((prop: string) => {
        const elementValue = params[prop as keyof object];
        if (!elementValue) return null;

        return prop.startsWith("refine_")
          ? "refine=" + prop.replace("refine_", "") + "=" + elementValue
          : prop + "=" + elementValue;
      })
      .filter(Boolean)
      .join("&")
  );
};

export const toRefineParams = (
  extraParams: { key: string; value: string }[],
) => {
  return extraParams.reduce((initial, param) => {
    return {
      ...initial,
      [`refine=${param.key}`]: param.value,
    };
  }, {});
};

export const toPriceRange = (pricingRange: PricingRange | undefined) => {
  if (
    !pricingRange ||
    typeof pricingRange.minValue == "string" ||
    typeof pricingRange.maxValue == "string" ||
    (typeof pricingRange.minValue == "undefined" &&
      typeof pricingRange.maxValue == "undefined")
  ) {
    return undefined;
  }

  return `(${pricingRange.minValue ? Math.floor(pricingRange.minValue) : ""}..${
    pricingRange.maxValue ? Math.floor(pricingRange.maxValue) : ""
  })`;
};

export const convertSecondsToDate = (seconds: number): Date => {
  const actualDate = new Date();
  return new Date(actualDate.getTime() + seconds * 1000);
};

export function removeParenthesis(s: string) {
  return s.replace(/\(|\)/g, "");
}

export function getPriceRange(s: string, position: number) {
  return Number(s.split("..")[position]);
}
