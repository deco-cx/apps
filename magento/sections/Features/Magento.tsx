import { useScriptAsDataURI } from "deco/hooks/useScript.ts";
import { AppContext, Features } from "../../mod.ts";
import { SectionProps } from "deco/types.ts";
import { SESSION_STORAGE_KEY } from "../../utils/constants.ts";

const snippet = (features: Features, key: string) => {
  const feats = sessionStorage.getItem(key);
  if (feats) {
    return;
  }
  sessionStorage.setItem(key, btoa(JSON.stringify(features)));
};

export default function MagentoFeatures(props: SectionProps<typeof loader>) {
  return (
    <script
      type="text/javascript"
      defer
      src={useScriptAsDataURI(snippet, props, SESSION_STORAGE_KEY)}
    />
  );
}

export const loader = (_props: unknown, _req: Request, ctx: AppContext) => {
  return ctx.features;
};
