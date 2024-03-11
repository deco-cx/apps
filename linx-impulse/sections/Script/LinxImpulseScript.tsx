import { Head } from "$fresh/runtime.ts";
import { SectionProps } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";

export const loader = (_props: unknown, _req: Request, ctx: AppContext) => ({
  apiKey: ctx.apiKey,
});

export default function LinxImpulseScript(
  { apiKey }: SectionProps<ReturnType<typeof loader>>,
) {
  return (
    <Head>
      <script
        defer
        async
        src="//suite.linximpulse.net/impulse/impulse.js"
        data-apikey={apiKey}
      />
    </Head>
  );
}
