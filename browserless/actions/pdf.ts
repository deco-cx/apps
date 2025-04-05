import type { AppContext } from "../mod.ts";
import { PdfParams } from "../client.ts";

/**
 * @title Generate PDF
 * @description Creates a PDF from a page
 *
 * This action returns a Blob object containing the PDF data.
 * You can convert this Blob to:
 * 1. A URL: URL.createObjectURL(blob)
 * 2. A base64 string: Use FileReader to read as data URL
 * 3. Save it as an asset using website/loaders/asset.ts
 *
 * @example
 * ```ts
 * import { pdf } from "apps/browserless/actions/pdf.ts";
 * import { asset } from "apps/website/loaders/asset.ts";
 *
 * // Example of saving to an asset
 * const blob = await pdf({url: "https://example.com"});
 * const savedPdf = await asset({file: blob, name: "document.pdf"});
 * ```
 */
export default async function pdf(
  props: PdfParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getPdf(props);
}
