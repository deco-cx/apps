import { AppContext } from "../mod.ts";
import { AggregateRating, Product } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { Ratings } from "../utils/types.ts";
import { createClient, getProductId } from "../utils/client.ts";
// export type Props = ConfigVerifiedReviews;

/**
 * @title Opiniões verificadas - Ratings for Products[]
 */
export default function productList(
	config: any,
	req: Request,
	ctx: AppContext
): ExtensionOf<Product[] | null> {
	const client = createClient({ ...ctx });

	return async (products: Product[] | null) => {
		if (!products) {
			return null;
		}
		if (!client) return products;

		const productsIds = products.map(getProductId);
		// const productsIds = ["55766", "50015", "70411", "66268", "6563"] // MOCK PRODUCTS WITH RATINGS
		const ratings = await client.ratings({ productsIds: productsIds });

		return products.map((product) => {
			const productId = getProductId(product);
			// const productId = productsIds?.[index] ?? ""; // MOCK PRODUCT ID WITH RATING
			product.aggregateRating = getRatingProduct({
				ratings,
				productId: productId,
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
