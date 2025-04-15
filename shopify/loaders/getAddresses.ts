import { PostalAddress } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { FetchCustomerAddresses } from "../utils/storefront/queries.ts";
import { Customer } from "../utils/storefront/storefront.graphql.gen.ts";
import { getUserCookie } from "../utils/user.ts";

/**
 * @title Shopify Integration
 * @description Get User Addresses
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<PostalAddress[] | null> => {
  const { storefront } = ctx;

  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) return null;

  try {
    const customer = await storefront.query<
      { customer: Customer },
      { customerAccessToken: string }
    >({
      variables: { customerAccessToken },
      ...FetchCustomerAddresses,
    }).then((data) => data.customer);

    if (!customer) return null;

    const addresses = customer.addresses.edges;

    return addresses.map((address) => ({
        "@type": "PostalAddress",
        "identifier": address.node.id,
        addressLine1: address.node.address1 ?? "",
        city: address.node.city ?? "",
        country: address.node.country ?? "",
        postalCode: address.node.zip ?? "",
        state: address.node.province ?? "",
        recipient: address.node.name ?? "",
    }));
  } catch {
    return null;
  }
};

export default loader;
