import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";
import { PageName, RecommendationShelf } from "../../utils/types/chaordic.ts";

interface Props {
  path: string;
}

const toOptions = ([position, shelves]: [string, RecommendationShelf[]]) =>
  shelves.map((s) => ({
    label: `${s.title} - ${position} (${s.displays[0].recommendations.length})`,
    value: s.feature,
  }));

const loader = async (props: Props, req: Request, ctx: AppContext) => {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const { apiKey, secretKey, salesChannel } = ctx;
  const params = new URL(req.url).searchParams;
  const pageType = (params.get("type") ?? "home") as PageName;

  const categoryIds = props.path.split("/").filter((path) =>
    path !== "hotsite"
  );

  const response = await ctx.chaordicApi["GET /v0/pages/recommendations"]({
    name: pageType,
    ...(pageType === "category" || pageType === "subcategory"
      ? { "categoryId[]": categoryIds }
      : {}),
    apiKey,
    secretKey,
    deviceId: "deco",
    source: "desktop",
    salesChannel,
    productFormat: "onlyIds",
  }).then((res) => res.json());

  return Object.entries(response).flatMap(toOptions);
};

export default loader;
