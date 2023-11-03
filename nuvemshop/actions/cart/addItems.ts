import { AppContext } from "../../mod.ts";
import { DESIRED_COOKIES, setCartCookie } from "../../utils/cart.ts";
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
  urlencoded.append("add_to_cart", itemId.toString());
  urlencoded.append("quantity", quantity.toString());
  urlencoded.append("add_to_cart_enhanced", add_to_cart_enhanced);

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

  const cookiesToSet = [];

  for (const cookieStr of setCookiesArray) {
    for (const desiredCookie of DESIRED_COOKIES) {
      if (cookieStr.trim().startsWith(desiredCookie)) {
        cookiesToSet.push(cookieStr.trim());
        break;
      }
    }
  }

  for (const cookie of cookiesToSet) {
    ctx.response.headers.append("Set-Cookie", cookie);
  }

  return result.cart;
};

export default action;
