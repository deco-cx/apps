import { AppContext } from "../mod.ts";
import { AggregateRating, Product } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { Ratings } from "../utils/types.ts";
import { createClient } from "../utils/client.ts";
// export type Props = ConfigVerifiedReviews;

const getProductId = (product: Product) => product.isVariantOf!.productGroupID;

/**
 * @title Opiniões verificadas
 */
export default function productList(
	config: any,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> {
	const client = createClient({...ctx});

	return async (products: Product[] | null) => {
		if (!products) {
			return null;
		}
		if (!client) return products;

		const productsIds = products.map(getProductId);
		// const ratings = await client.ratings({
		//   productsIds: ["50015", "55766", "73404", "64944"], // MOCK PRODUCTS WITH RATINGS
		// });
		const ratings = await client.ratings({ productsIds: productsIds });

		return products.map((product) => {
			const productId = getProductId(product);
			product.aggregateRating = getRatingProduct({
				ratings,
				productId: productId,
				// productId: "50015", // MOCK PRODUCT ID WITH RATING
			});
			return product;
		});
	};
}

const getRatingProduct = ({
	ratings,
	productId,
}: {
	ratings: Ratings | undefined;
	productId: string;
}): AggregateRating | undefined => {
	if (!ratings) return undefined;
	const rating = ratings[productId]?.[0];
	if (!rating) return undefined;

	return {
		"@type": "AggregateRating",
		ratingCount: Number(rating.count),
		ratingValue: Number(parseFloat(rating.rate).toFixed(1)),
	};
};
