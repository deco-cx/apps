import { PricingRange } from "./types.ts";

const mapped = JSON.parse(
  `{"Á":"A","Ä":"A","Â":"A","À":"A","Ã":"A","Å":"A","Č":"C","Ç":"C","Ć":"C","Ď":"D","É":"E","Ě":"E","Ë":"E","È":"E","Ê":"E","Ẽ":"E","Ĕ":"E","Ȇ":"E","Í":"I","Ì":"I","Î":"I","Ï":"I","Ň":"N","Ñ":"N","Ó":"O","Ö":"O","Ò":"O","Ô":"O","Õ":"O","Ø":"O","Ř":"R","Ŕ":"R","Š":"S","Ť":"T","Ú":"U","Ů":"U","Ü":"U","Ù":"U","Û":"U","Ý":"Y","Ÿ":"Y","Ž":"Z","á":"a","ä":"a","â":"a","à":"a","ã":"a","å":"a","č":"c","ç":"c","ć":"c","ď":"d","é":"e","ě":"e","ë":"e","è":"e","ê":"e","ẽ":"e","ĕ":"e","ȇ":"e","í":"i","ì":"i","î":"i","ï":"i","ň":"n","ñ":"n","ó":"o","ö":"o","ò":"o","ô":"o","õ":"o","ø":"o","ð":"o","ř":"r","ŕ":"r","š":"s","ť":"t","ú":"u","ů":"u","ü":"u","ù":"u","û":"u","ý":"y","ÿ":"y","ž":"z","þ":"b","Þ":"B","Đ":"D","đ":"d","ß":"B","Æ":"A","a":"a"}`,
);

export const slugfy = (str: string) =>
  str
    .replace(/,/g, "")
    .replace(/[·/_,:]/g, "-")
    .replace(/[*+~.()'"!:@&\[\]`/ %$#?{}|><=_^]/g, "-")
    .split("")
    .map((char) => mapped[char] ?? char)
    .join("")
    .toLowerCase();

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
