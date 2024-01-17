import { AppContext } from "../../mod.ts";
import { setCartContextCookies, setCartCookie } from "../../utils/cart.ts";
import { UpdateCartResponse } from "../../utils/types.ts";

export interface AddItemProps {
  quantity: number;
  itemId: number;
  add_to_cart_enhanced: string;
  attributes: Record<string, string>;
}

const action = async (
  { quantity, itemId, add_to_cart_enhanced = "1", attributes }: AddItemProps,
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
  urlencoded.append("add_to_cart", itemId.toString());
  urlencoded.append("quantity", quantity.toString());
  urlencoded.append("add_to_cart_enhanced", add_to_cart_enhanced);
  Object.values(attributes)?.map((value, idx) => {
    urlencoded.append(`variation[${idx}]`, value);
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  const buyUrl = new URL("/comprar/", publicUrl);

  const response = await fetch(
    buyUrl.href,
    requestOptions,
  );

  const result = await response.json();

  setCartCookie(ctx.response.headers, result?.cart?.id);

  const setCookiesArray = response.headers.get("set-cookie")?.split(",") || [];

  setCartContextCookies(ctx.response.headers, setCookiesArray);

  return result.cart;
};

export default action;
