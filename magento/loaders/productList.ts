import type { ProductDetailsPage } from "../../commerce/types.ts";
/* import type { RequestURLParam } from "../../website/functions/requestToParam.ts"; */
import { AppContext } from "../mod.ts";
import {
  GraphQLProductShelf,
  GraphQLProductShelfInputs,
} from "../utils/clientGraphql/types.ts";
import { gql } from "../../utils/graphql.ts";
/* import { URL_KEY } from "../utils/constants.ts";
import stringifySearchCriteria from "../utils/stringifySearchCriteria.ts";
import { toBreadcrumbList, toProduct, toSeo } from "../utils/transform.ts"; */

/* ßß */

export const GetProduct = { 
  fragments: [],
  query: gql`{
    products(search: "Sabonete", pageSize: 1) {
      total_count
      items {
        name
        price_range {
          minimum_price {
            regular_price {
              value
              currency
            }
          }
        }
      }
      page_info {
        page_size
        current_page
      }
      sort_fields {
        default
        options {
          label
          value
        }
      }
    }
  }`,
};

/**
 * @title Magento Integration - Product Listing loader
 */
async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage | null> {
  const { clientGraphql } = ctx;
  try {
    const data = await clientGraphql.query<GraphQLProductShelf, GraphQLProductShelfInputs>({
        variables: {},
        ...GetProduct,
      });
    console.log(data.products.items)
  } catch (error) {
    console.log(error)
  }
  
  return null;
}

export default loader;
