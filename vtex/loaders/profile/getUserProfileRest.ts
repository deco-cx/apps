import { AppContext } from "../../mod.ts";

interface Props {
  email: string;
  ensureComplete?: boolean;
}

export async function loader(
  { email, ensureComplete }: Props,
  _req: Request,
  ctx: AppContext,
) {
  const { vcs } = ctx;

  const response = await vcs["GET /api/checkout/pub/profiles"]({
    email,
    ensureComplete,
  }, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();

  return data;
}

export const defaultVisibility = "private";
export default loader;
