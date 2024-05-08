import { Head } from "$fresh/runtime.ts";
import { AppContext, Extension } from "../mod.ts";
import { scriptAsDataURI } from "../../utils/dataURI.ts";
import { SectionProps } from "deco/mod.ts";

const script = (extensions: Extension[]) => {
  if (extensions.length > 0) {
    document.body.setAttribute("hx-ext", extensions.join(","));
  }
};

function Section({ version, cdn, extensions }: SectionProps<typeof loader>) {
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

export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return { version: ctx.version!, cdn: ctx.cdn!, extensions: ctx.extensions! };
};

export default Section;
