import { AppContext } from "../../mod.ts";
import { setCartCookie } from "../../utils/cart.ts";
import { UpdateCartResponse } from "../../utils/types.ts";

export interface AddItemProps {
  quantity: number;
  itemId: number;
  add_to_cart_enhanced: string;
}

const action = async (
  { quantity, itemId, add_to_cart_enhanced = "1" }: AddItemProps,
  req: Request,
  ctx: AppContext,
): Promise<UpdateCartResponse | null> => {
  const { publicUrl } = ctx;

  const myHeaders = new Headers();

  const requestCookies = req.headers.get("Cookie");

  if (requestCookies) {
    myHeaders.append("Cookie", requestCookies);
  }

  myHeaders.append("Origin", publicUrl);
  myHeaders.append(
    "Referer",
    req.url,
  );
  myHeaders.append("X-Requested-With", "XMLHttpRequest");
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("add_to_cart", `${itemId}`);
  urlencoded.append("quantity", `${quantity}`);
  urlencoded.append("add_to_cart_enhanced", add_to_cart_enhanced);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  const response = await fetch(
    `${publicUrl}/comprar/`,
    requestOptions,
  );

  const result = await response.json();

  setCartCookie(ctx.response.headers, result?.cart?.id);

  ctx.response.headers.append("Set-Cookie", response.headers.get("set-cookie"));

  return result.cart;
};

export default action;
