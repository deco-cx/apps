import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { SESSION_COOKIE } from "../utils/constants.ts";
import { getUserCookie } from "../utils/user.ts";

/**
 * @title Magento Integration - User
 * @description Get user loader
 */
async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> {
  const { clientAdmin, site } = ctx;

  const id = getUserCookie(req.headers);

  try {
    const response = await clientAdmin["GET /:site/customer/section/load"]({
      site,
      sections: "customer,carbono-customer",
    }, { headers: new Headers({ Cookie: `${SESSION_COOKIE}=${id}` }) })
      .then((
        res,
      ) => res.json());
    const user = response["carbono-customer"];
    const customer = response.customer;

    if (!user?.customerId || !customer) {
      return null;
    }

    const { customerId, email } = user;
    const { fullname, firstname } = customer;
    return {
      "@id": customerId,
      email: email,
      givenName: firstname,
      ...(firstname && fullname &&
        { familyName: fullname.replace(firstname, "").trim() }),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default loader;
