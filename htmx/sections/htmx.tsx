import { Head } from "$fresh/runtime.ts";
import { AppContext, Extension } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
import { useScript } from "@deco/deco/hooks";
const script = (extensions: Extension[]) => {
  if (extensions.length > 0) {
    if (document.readyState === "complete") {
      document.body.setAttribute("hx-ext", extensions.join(","));
      return;
    }
    globalThis.onload = () => {
      document.body.setAttribute("hx-ext", extensions.join(","));
    };
  }
};
function Section({ version, cdn, extensions }: SectionProps<typeof loader>) {
  return (
    <Head>
      <script
        dangerouslySetInnerHTML={{ __html: useScript(script, extensions) }}
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
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return { version: ctx.version!, cdn: ctx.cdn!, extensions: ctx.extensions! };
};
export default Section;
