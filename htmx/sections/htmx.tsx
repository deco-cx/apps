import { Head } from "$fresh/runtime.ts";
import { AppContext } from "../mod.ts";

function Section(
  { version = "1.9.11", cdn = "https://cdn.jsdelivr.net/npm" }: {
    version?: string;
    cdn?: string;
  },
) {
  return (
    <Head>
      <script
        src={`${cdn}/htmx.org@${version}`}
        crossOrigin="anonymous"
      />
    </Head>
  );
}

export const loader = (_: unknown, __: Request, ctx: AppContext) => {
  return { version: ctx.version };
};

export default Section;
