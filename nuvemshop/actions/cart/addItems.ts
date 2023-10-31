import { AppContext } from "../../mod.ts";
import {
  getCartCookie,
  setCartCookie,
  setStoreSessionCookie,
  setStoreSessionPayloadCookie,
} from "../../utils/cart.ts";
import { getCookies, setCookie } from "std/http/cookie.ts";

const action = async (
  { quantity, itemId, add_to_cart_enhanced }: UpdateLineProps,
  req: Request,
  ctx: AppContext,
): Promise<CartFragment | null> => {
  console.log("add Item");
  const { publicUrl } = ctx;

  var myHeaders = new Headers();

  const requestCookies = req.headers.get("Cookie");

  // Adiciona cookies ao myHeaders, se existirem
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

  var urlencoded = new URLSearchParams();
  urlencoded.append("add_to_cart", itemId);
  urlencoded.append("quantity", quantity);
  urlencoded.append("add_to_cart_enhanced", add_to_cart_enhanced);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow",
  };

  const response = await fetch(
    `${publicUrl}/comprar/`,
    requestOptions,
  );

  const result = await response.json();
  console.log(result.cart.id);
  setCartCookie(ctx.response.headers, result?.cart?.id);

  const setCookiesArray = response.headers.get("set-cookie")?.split(",") || [];
  const desiredCookies = [
    "store_session_payload_2734114",
    "store_login_session",
  ];
  let cookiesToSet = [];

  for (const cookieStr of setCookiesArray) {
    for (const desiredCookie of desiredCookies) {
      console.log("quebra: ", cookieStr.trim());
      if (cookieStr.trim().startsWith(desiredCookie)) {
        cookiesToSet.push(cookieStr.trim());
        break; // exit inner loop when found
      }
    }
  }

  console.log("toset", cookiesToSet);

  for (const cookie of cookiesToSet) {
    ctx.response.headers.append("Set-Cookie", cookie); // Use append para adicionar múltiplos Set-Cookie headers
  }

  return result;
};

export default action;
