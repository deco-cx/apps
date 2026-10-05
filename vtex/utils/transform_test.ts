import { assertEquals, assertStrictEquals } from "@std/assert";
import { toProduct } from "./transform.ts";
import type { LegacyProduct } from "./types.ts";

const sku = (itemId: string) => ({
  itemId,
  name: `Vestido - ${itemId}`,
  images: [],
  sellers: [],
  referenceId: [{ Key: "RefId", Value: `ref-${itemId}` }],
  variations: [],
});

const product = {
  productId: "1",
  productName: "Vestido",
  linkText: "vestido",
  brand: "Farm",
  categories: ["/Moda Feminina/Vestido/"],
  categoriesIds: ["/1/2/"],
  productClusters: { "10": "Verão", "11": "Novidades" },
  clusterHighlights: { "11": "Novidades" },
  allSpecifications: ["Tecido"],
  allSpecificationsGroups: ["Info"],
  Info: ["Tecido"],
  Tecido: ["Linho"],
  items: [sku("a"), sku("b")],
} as unknown as LegacyProduct;

Deno.test("toProduct: every variant carries the product's category and cluster properties", () => {
  const out = toProduct(product, product.items[0], 0, {
    baseUrl: "https://example.com",
    priceCurrency: "BRL",
  });
  const productLevel = (p: { additionalProperty?: { name?: string }[] }) =>
    p.additionalProperty?.filter((x) =>
      x.name === "category" || x.name === "cluster"
    );

  assertEquals(productLevel(out)?.length, 4); // 2 categories + 2 clusters
  assertEquals(out.isVariantOf!.hasVariant.length, product.items.length);
  for (const variant of out.isVariantOf!.hasVariant) {
    assertEquals(productLevel(variant), productLevel(out));
    // shared, not rebuilt per SKU
    assertStrictEquals(productLevel(variant)![0], productLevel(out)![0]);
    assertEquals((variant as { isVariantOf?: unknown }).isVariantOf, undefined);
  }
  assertEquals(
    out.isVariantOf!.additionalProperty.map((p) => p.value),
    ["Linho"],
  );
});
