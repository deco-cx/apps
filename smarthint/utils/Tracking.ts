import { getCookies, setCookie } from "std/http/cookie.ts";

export const getData = () => {
  const dataWithComma = new Date().toLocaleString("pt-BR");
  const data = dataWithComma.replace(",", "")
  return data
}

export const getCookie = (type:
    | "smarthint_anonymous_consumer"
    | "smarthint_session"
    | "smarthint_timestamp" 
    | "smarthint_origin", headers: Headers): string | undefined => {
    const cookies = getCookies(headers);
  
    return cookies[type];
  };

export const setCookies = (type: "smarthint_origin", value: string, headers: Headers) =>
setCookie(headers, {
  name: type,
  value: value,
  path: "/",
  httpOnly: true,
  secure: true,
});