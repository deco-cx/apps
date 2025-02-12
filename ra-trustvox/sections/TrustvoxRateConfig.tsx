import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
declare global {
  interface Window {
    _trustvox_shelf_rate: Array<[
      string,
      string | number | Array<string | undefined> | undefined,
    ]>;
  }
}
export default function TrustvoxRateConfig(
  { storeId, enableStaging }: SectionProps<typeof loader>,
) {
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-rate-staging/widget.js"
    : "https://rate.trustvox.com.br/widget.js";
  function setupTrustvoxRateConfig(storeId: string) {
    globalThis.window._trustvox_shelf_rate = [];
    globalThis.window._trustvox_shelf_rate.push(["_storeId", storeId]);
    globalThis.window._trustvox_shelf_rate.push(["_productContainer", "body"]);
    globalThis.window._trustvox_shelf_rate.push(["_watchSubtree", "true"]);
  }
  return (
    <>
      <script defer src={scriptAsDataURI(setupTrustvoxRateConfig, storeId)} />
      <script defer type="text/javascript" src={scriptUrl} />
    </>
  );
}
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return {
    storeId: ctx.storeId,
    enableStaging: ctx.enableStaging,
  };
};
