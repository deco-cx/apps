import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";
import { exclusionPropsAndHashScript } from "../../utils/plausible_scripts.ts";
import { getFlagsFromCookies } from "../../utils/cookie.ts";

export type Props = {
  defer?: boolean;
};

const loader = (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Script => {
  const transformReq = (req: Request) => {
    const link1 =
      '<link rel="dns-prefetch" href="https://plausible.io/api/event" />';
    const link2 =
      '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous" />';

    const flags = getFlagsFromCookies(req);

    const plausibleScript = `<script ${
      props.defer ? "defer" : ""
    } data-exclude="/proxy" ${
      flags.map((
        { flagName, flagValue },
      ) => (`event-${flagName}="${flagValue}"`)).join(
        " ",
      )
    } data-api="https://plausible.io/api/event">${exclusionPropsAndHashScript}</script>`;
    return link1 + link2 + plausibleScript;
  };
  return ({ src: transformReq });
};

export default loader;
