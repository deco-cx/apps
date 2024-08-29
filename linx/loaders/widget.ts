import { AppContext } from "../mod.ts";

export interface Props {
  widget: string;
  params: Record<string, string>;
}

export default async function widgetLoader(
  props: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { widget, params } = props;

  const response = await ctx.api["GET /widget/:widget"]({
    widget,
    ...params,
  });

  if (!response) {
    return null;
  }

  return response.json();
}
