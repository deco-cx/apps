import { type Props } from "../../../openai/loaders/vision.ts";
import { AppContext } from "../../mod.ts";

export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<string | null> {
  const response = await ctx.invoke("openai/loaders/vision.ts", props);

  return response.choices?.[0]?.message.content;
}
