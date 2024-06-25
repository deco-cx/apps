import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { state } from "../mod.ts";

declare global {
  interface Window {
    _trustvox_shelf_rate: Array<
      [string, string | number | Array<string | undefined> | undefined]
    >;
  }
}

export default function TrustvoxRateConfig() {
  const { storeId, enableStaging = false } = state;
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-rate-staging/widget.js"
    : "https://rate.trustvox.com.br/widget.js";

  function setupTrustvoxRateConfig(
    storeId: string,
  ) {
    globalThis.window._trustvox_shelf_rate = [];
    globalThis.window._trustvox_shelf_rate.push(["_storeId", storeId]);
    globalThis.window._trustvox_shelf_rate.push(["_productContainer", "body"]);
    globalThis.window._trustvox_shelf_rate.push(["_watchSubtree", "true"]);
  }

  return (
    <>
      <script
        defer
        src={scriptAsDataURI(
          setupTrustvoxRateConfig,
          storeId,
        )}
      />
      <script
        defer
        type="text/javascript"
        src={scriptUrl}
      />
    </>
  );
}
