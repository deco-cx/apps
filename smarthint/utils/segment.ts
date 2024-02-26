import { getCookies, setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";

export interface Cookie {
  name: string;
  value: unknown;
  path: string;
}

export interface Segment  {
    anonymous_cookie: string;
    session_cookie: string; 
    session_timestamp: string;
}

const SEGMENT = Symbol("segment");

export const getSegmentFromBag = (ctx: AppContext): string =>
  ctx.bag?.get(SEGMENT);
export const setSegmentInBag = (ctx: AppContext, segment: Segment) =>
  ctx.bag?.set(SEGMENT, segment);

export function parse(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookiePairs = cookieString.split(";");

  for (const pair of cookiePairs) {
    const [name, value] = pair.trim().split("=");
    cookies[name] = value;
  }

  return cookies;
}

export const getSegmentFromCookie = (
    type:
    | "smarthint_anonymous_consumer"
    | "smarthint_session"
    | "smarthint_timestamp",
    req: Request,
    ): string | undefined => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[type];
  return cookie;
};

export const setSegmentCookie = (
  segment: string,
  type:
    | "smarthint_anonymous_consumer"
    | "smarthint_session"
    | "smarthint_timestamp",
    headers: Headers = new Headers(),
): Headers => {
    setCookie(headers, {
        value: segment,
        name: type,
        path: "/",
        secure: true,
        httpOnly: true,
    });
    return headers;
};


export async function sha256Hash(input: string) {
  const utf8Encoder = new TextEncoder();
  const inputBytes = utf8Encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", inputBytes);

  return Array.prototype.map.call(new Uint8Array(hashBuffer), (byte) => {
    return ("00" + byte.toString(16)).slice(-2);
  }).join("");
}

export async function generateUniqueIdentifier() {
  const timestamp = new Date().getTime();
  const randomComponent = Math.floor(Math.random() * 1000000);
  const inputForHash = `${timestamp}${randomComponent}`;
  const sha256 = await sha256Hash(inputForHash);
  return { hash: sha256, timestamp };
}

export function checkDurationOrDayChange(currentTime?: string): boolean {
  if (!currentTime) {
    return true;
  }
  const currentTimeObj = new Date(currentTime);
  const now = new Date();

  if (currentTimeObj.getDate() !== now.getDate()) {
    return true;
  }

  // Check for 30 minutes of duration
  const timeDifferenceMs = now.getTime() - currentTimeObj.getTime();
  const timeDifferenceMin = timeDifferenceMs / (1000 * 60);
  if (timeDifferenceMin >= 30) {
    return true;
  }

  return false;
}

export function diffInSeconds(timestamp: number): string {
  // Obtém o timestamp atual em milissegundos
  const currentTimestamp = new Date().getTime();
  
  // Calcula a diferença entre os timestamps em milissegundos
  const differenceInMillis = currentTimestamp - timestamp;
  
  // Converte a diferença de milissegundos para segundos
  const differenceInSeconds = Math.floor(differenceInMillis / 1000);
  
  return differenceInSeconds.toString();
}
