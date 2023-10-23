import { AppContext } from "../mod.ts";
import { Script } from "../../website/types.ts";
import { exclusionAndHashScript } from "../../utils/plausible_scripts.ts";

export type Props = {
  defer?: boolean;
};

const loader = (
  props: Props,
  _req: Request,
  _ctx: AppContext,
): Script => {
  const link1 =
    '<link rel="dns-prefetch" href="https://plausible.io/api/event" />';
  const link2 =
    '<link rel="preconnect" href="https://plausible.io/api/event" crossorigin="anonymous" />';
  const plausibleScript = `<script ${
    props.defer ? "defer" : ""
  } data-exclude="/proxy" data-api="https://plausible.io/api/event">${exclusionAndHashScript}</script>`;

  return { src: link1 + link2 + plausibleScript };
};

export default loader;
