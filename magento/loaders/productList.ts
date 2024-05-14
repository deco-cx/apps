import type { ProductDetailsPage } from "../../commerce/types.ts";
/* import type { RequestURLParam } from "../../website/functions/requestToParam.ts"; */
import { AppContext } from "../mod.ts";
import {
  GraphQLShelf,
  GraphQLShelfQuery,
} from "../utils/clientGraphql/types.ts";
import { gql } from "../../utils/graphql.ts";
/* import { URL_KEY } from "../utils/constants.ts";
import stringifySearchCriteria from "../utils/stringifySearchCriteria.ts";
import { toBreadcrumbList, toProduct, toSeo } from "../utils/transform.ts"; */

//export interface Props {}

export const GetProduct = { 
  fragments: [],
  query: gql`{
    products(search: "Sabonete", pageSize: 2) {
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
    const data = await clientGraphql.query<GraphQLShelf, GraphQLShelfQuery>({
        variables: {},
        ...GetProduct,
      });
    console.log(data)
  } catch (error) {
    console.log(error)
  }
  
  return null;
}

export default loader;
