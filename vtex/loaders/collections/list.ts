import { AppContext } from "../../mod.ts";
import { CollectionList } from "../../utils/types.ts";
import { allowCorsFor } from "@deco/deco";
export interface Props {
  term?: string;
}
export default async function loader(
  { term }: Props,
  req: Request,
  ctx: AppContext,
) {
  Object.entries(allowCorsFor(req)).map(([name, value]) => {
    ctx.response.headers.set(name, value);
  });
  const { vcs } = ctx;
  const collectionResponse = term
    ? await vcs["GET /api/catalog_system/pvt/collection/search/:searchTerms"]({
      searchTerms: term,
      page: 1,
      pageSize: 15,
    })
    : await vcs["GET /api/catalog_system/pvt/collection/search"]({
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
