import { AppContext, Features } from "../mod.ts";

//To avoid selection
type Feats = Features;

function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Feats {
  return ctx.features;
}

export default loader;
