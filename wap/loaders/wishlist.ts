import { AppContext } from "../mod.ts";

/**
 * @title Wap Integration
 * @description Product Wishlist loader
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<number[] | null> => {
  const { api } = ctx;

  const data = await api
    ["GET /api/v2/front/wishlist"]({}, {
      headers: req.headers,
    }).then((response) => response.json()) as { favoritos: number[] };

  return data?.favoritos;
};

export default loader;
