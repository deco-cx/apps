import { assertEquals } from "@std/assert";
import GetCategories from "../loaders/GetCategories.ts";
import { AppContext } from "../mod.ts";
import { Category } from "../types.ts";

const COLLECTION_PATH = "collections/blog/categories";

/**
 * Categories share `getRecordsByPath` with posts, so they'd be collateral damage
 * if the publication filter ever moved down into the records layer. Stubbing
 * `ctx.get` the same way the post tests do is enough to pin that down.
 */
const ctxWith = (categories: Record<string, unknown>[]) =>
  ({
    get: () =>
      Promise.resolve(
        Object.fromEntries(categories.map((category) => [
          `${COLLECTION_PATH}/${category.slug}`,
          { name: `${COLLECTION_PATH}/${category.slug}`, category },
        ])),
      ),
  }) as unknown as AppContext;

const req = new Request("https://example.com/blog");

Deno.test("categories have no lifecycle, so none of them is ever filtered out", () => {
  // The stray `status` is the point: categories are authored by the same CMS and
  // may carry the field, but it means nothing here and must not hide anything.
  const ctx = ctxWith([
    { name: "Alpha", slug: "alpha" },
    { name: "Beta", slug: "beta", status: "draft" },
    { name: "Gamma", slug: "gamma", status: "generating" },
    {
      name: "Delta",
      slug: "delta",
      status: "scheduled",
      scheduledDatetime: new Date(Date.now() + 86_400_000).toISOString(),
    },
  ]);

  return GetCategories({}, req, ctx).then((categories) => {
    assertEquals(
      categories?.map(({ slug }: Category) => slug).sort(),
      ["alpha", "beta", "delta", "gamma"],
    );
  });
});

Deno.test("a category is still reachable by slug regardless of any status", async () => {
  const categories = await GetCategories(
    { slug: "beta" },
    req,
    ctxWith([{ name: "Beta", slug: "beta", status: "draft" }]),
  );

  assertEquals(categories?.length, 1);
  assertEquals(categories?.[0].slug, "beta");
});
