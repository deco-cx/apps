import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";
import {
  defaultExclusionPropsAndHashScript,
  exclusionPropsAndHashScript,
} from "../scripts/plausible_scripts.ts";
import { getFlagsFromCookies } from "../../utils/cookie.ts";

export type Props = {
  defer?: boolean;
  domain?: string;
};

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
      flags.map((
        { flagName, flagActive },
      ) => (`event-${flagName}="${flagActive}"`)).join(
        " ",
      )
    } ${
      props.domain ? "data-domain=" + props.domain : ""
    } data-api="https://plausible.io/api/event">${
      props.domain
        ? defaultExclusionPropsAndHashScript
        : exclusionPropsAndHashScript
    }</script>`;
    return dnsPrefetchLink + preconnectLink + plausibleScript;
  };
  return ({ src: transformReq });
};

export default loader;
