import { getFlagsFromCookies } from "../../utils/cookie.ts";
import { Script } from "../../website/types.ts";
import { AppContext } from "../mod.ts";
import {
  defaultExclusionPropsAndHashScript,
  exclusionPropsAndHashScript,
} from "../scripts/plausible_scripts.ts";
import { dataURI, scriptAsDataURI } from "../../utils/dataURI.ts";

export type Props = {
  defer?: boolean;
  domain?: string;
};

declare global {
  interface Window {
    plausible: (
      name: string,
      params: { props: Record<string, string | boolean> },
    ) => void;
  }
}

const loader = (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Script => {
  const transformReq = (req: Request) => {
    const dnsPrefetchLink =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event" />';
    const preconnectLink =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous" />';

    const flags = getFlagsFromCookies(req);

    const plausibleScript = `<script ${
      props.defer ? "defer" : ""
    } data-exclude="/proxy" ${
      props.domain ? "data-domain=" + props.domain : ""
    } data-api="https://plausible.io/api/event" src="https://plausible.io/js/script.manual.local.js"></script>`;

    const snippet = `
      plausible('pageview', {props: {
        ${flags.map(({ flagName, flagActive }) => `"${flagName}": "${flagActive}",`)}
      }})
    `

    const flagsScript = `<script defer src="${dataURI("text/javascript", true, `(${snippet})()`)}"></script>`;

    return dnsPrefetchLink + preconnectLink + plausibleScript + flagsScript;
  };
  return ({ src: transformReq });
};

export default loader;
