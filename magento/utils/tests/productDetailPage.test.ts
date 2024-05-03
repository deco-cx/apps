import { assertEquals } from "jsr:@std/assert";
import { Offer, Product } from "../../../commerce/types.ts";
import { toOffer, toProduct } from "../transform.ts";
import {
  expectedProduct,
  outOfStockOffer,
  productFromMagento,
} from "../moks/product.ts";

Deno.test("toProduct should convert Magento product to expected format", () => {
  const product = toProduct({ product: productFromMagento, options: {} });

  assertEquals<Product>(
    product,
    expectedProduct,
    "The converted product does not match the expected product.",
  );
});

Deno.test("to Offer must convert Magento pricing info to expected format with out-of-stock item", () => {
  const offer = toOffer(productFromMagento);
  assertEquals<Offer[]>(
    offer,
    outOfStockOffer,
    "The converted product does not match the expected product.",
  );
});
