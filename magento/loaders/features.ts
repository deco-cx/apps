import { AppContext, Features } from "../mod.ts";

//To avoid selection
type Feats = Features;

//Will be deleted soon
function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Feats {
  return ctx.features;
}

export default loader;
