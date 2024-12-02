import { AppContext } from "../mod.ts";
import { type SectionProps } from "@deco/deco";
export default function TrustvoxCertificate(
  { enableStaging = false }: SectionProps<typeof loader>,
) {
  const scriptUrl = enableStaging
    ? "https://storage.googleapis.com/trustvox-certificate-widget-staging/widget.js"
    : "https://certificate.trustvox.com.br/widget.js";
  return <script defer type="text/javascript" src={scriptUrl} />;
}
export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return {
    enableStaging: ctx.enableStaging,
  };
};
