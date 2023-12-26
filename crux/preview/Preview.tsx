import { BaseContext } from "deco/engine/core/resolver.ts";
import { AppRuntime } from "deco/types.ts";
import { App } from "../mod.ts";

// this base URL was found at this documentation: https://developer.chrome.com/docs/crux/dashboard?hl=pt-br
const BASE_CRUX_URL =
  "https://lookerstudio.google.com/embed/reporting/bbc5698d-57bb-4969-9e07-68810b9fa348/page/keDQB";

export default function Preview(app: AppRuntime<BaseContext, App["state"]>) {
  const siteUrl = app.state.siteUrl;

  const url = BASE_CRUX_URL + `?params=%7B"origin":"${encodeURI(siteUrl)}"%7D`;
  return (
    <div class="h-full">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            html{
                height: 100%;
            }
            body{
                height: 100%;
            }
            
            `,
        }}
      >
      </style>
      <iframe
        width="100%"
        height="100%"
        src={url}
        frameBorder="0"
        style="border:0"
        allowFullScreen
      >
      </iframe>
    </div>
  );
}
