import { Person } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { User } from "../utils/type.ts";

const genderMap = {
  f: "https://schema.org/Female" as const,
  m: "https://schema.org/Male" as const,
  i: undefined,
  o: undefined,
};

async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<Person | null> {
  const { api } = ctx;

  try {
    const user = await api
      ["GET /api/v2/front/checkout/user"]({}, {
        headers: req.headers,
      }).then((response) => response.json()) as User;

    return {
      "@id": String(user.id),
      email: user.email,
      givenName: user.nomeRazao,
      gender: genderMap[user.sexo],
    };
  } catch (_) {
    return null;
  }
}

export default loader;
