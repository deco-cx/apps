import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { getCartCookie } from "../utils/user.ts";

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> {
  const { clientAdmin, site } = ctx;

  const PHPSESSID = getCartCookie(req.headers);

  try {
    const response = await clientAdmin["GET /:site/customer/section/load"]({
      site,
      sections: "customer,carbono-customer",
    }, { headers: new Headers({ Cookie: `PHPSESSID=${PHPSESSID}` }) }).then((
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
