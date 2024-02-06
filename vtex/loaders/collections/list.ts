import { allowCorsFor } from "deco/mod.ts";
import { AppContext } from "../../mod.ts";
import { CollectionList } from "../../utils/types.ts";

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });

  const { vcs } = ctx;

  const collectionResponse = await vcs
    ["GET /api/catalog_system/pvt/collection/search"]({
      page: 1,
      pageSize: 3000,
      orderByAsc: false,
    });

  const collectionList = await collectionResponse.json();

  const stringList = (collectionList as CollectionList)?.items?.map((
    collection,
  ) => ({
    value: `${collection.id}`,
    label: `${collection.id} - ${collection.name}`,
  }));

  return stringList;
}
