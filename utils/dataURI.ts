let once = true;

// Avoid throwing DOM Exception:
// The string to be encoded contains characters outside of the Latin1 range.
const btoaSafe = (x: string) => {
  try {
    return btoa(x);
  } catch {
    // Fallback for strings with chars outside the Latin1 range (code points > 255).
    // encodeURIComponent converts each char to %XX sequences (ASCII-only), then
    // we replace each %XX with the corresponding byte char so btoa can handle it.
    return btoa(
      encodeURIComponent(x).replace(
        /%([0-9A-F]{2})/g,
        (_, hex) => String.fromCharCode(parseInt(hex, 16)),
      ),
    );
  }
};;

// deno-lint-ignore no-explicit-any
export const scriptAsDataURI = <T extends (...args: any[]) => any>(
  fn: T,
  ...params: Parameters<T>
) => {
  if (once) {
    once = false;
    console.warn(
      `scriptAsDataURI is deprecated and will soon be removed. Use import { useScriptAsDataURI } from 'deco/hooks/useScript.ts' instead.`,
    );
  }

  return dataURI(
    "text/javascript",
    true,
    `(${fn})(${params.map((p) => JSON.stringify(p)).join(", ")})`,
  );
};

export const dataURI = (
  contentType: "text/javascript",
  base64: boolean,
  content: string,
) => `data:${contentType}${base64 ? `;base64,${btoaSafe(content)}` : content}`;
