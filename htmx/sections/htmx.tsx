import { Head } from "$fresh/runtime.ts";
import { AppContext } from "../mod.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";

type Extension =
  | "ajax-header"
  | "alpine-morph"
  | "class-tools"
  | "client-side-templates"
  | "debug"
  | "event-header"
  | "head-support"
  | "include-vals"
  | "json-enc"
  | "idiomorph"
  | "loading-states"
  | "method-override"
  | "morphdom-swap"
  | "multi-swap"
  | "path-deps"
  | "preload"
  | "remove-me"
  | "response-targets"
  | "restored"
  | "server-sent-events"
  | "web-sockets"
  | "path-params";

interface Props {
  version?: string;
  cdn?: string;
  extensions?: Extension[];
}

const script = (extensions: Extension[]) => {
  if (extensions.length > 0) {
    document.body.setAttribute("hx-ext", extensions.join(","));
  }
};

function Section(
  {
    version = "1.9.11",
    cdn = "https://cdn.jsdelivr.net/npm",
    extensions = [],
  }: Props,
) {
  return (
    <Head>
      <script
        defer
        src={scriptAsDataURI(script, extensions)}
      />
      <script
        defer
        src={`${cdn}/htmx.org@${version}`}
        crossOrigin="anonymous"
      />
      {extensions.map((ext) => (
        <script
          defer
          src={`${cdn}/htmx.org@${version}/dist/ext/${ext}.js`}
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
}

export const loader = (_: unknown, __: Request, ctx: AppContext) => {
  return { version: ctx.version };
};

export default Section;
