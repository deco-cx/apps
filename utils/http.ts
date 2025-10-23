import { type RequestInit } from "@deco/deco";
import { fetchSafe } from "./fetch.ts";

// Check if DEBUG_HTTP env var is set
const DEBUG_HTTP = Deno.env.get("DEBUG_HTTP") === "true";
if (DEBUG_HTTP) {
  console.log("DEBUG_HTTP mode is:", DEBUG_HTTP ? "enabled" : "disabled");
}

const HTTP_VERBS = new Set(
  [
    "GET",
    "PUT",
    "POST",
    "DELETE",
    "PATCH",
    "HEAD",
  ] as const,
);
export class HttpError extends Error {
  constructor(public status: number, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.name = `HttpError ${status}`;
  }
}
export interface TypedRequestInit<T> extends Omit<RequestInit, "body"> {
  body: T;
  excludeFromSearchParams?: string[];
  templateMarker?: string;
}
export interface TypedResponse<T> extends Response {
  json: () => Promise<T>;
}
type HttpVerb = typeof HTTP_VERBS extends Set<infer Verb> ? Verb : never;
type URLPatternParam = string | number;
type URLPatternParams<URL extends string> = URL extends
  `/:${infer param}/${infer rest}` ?
    & {
      [key in param]: URLPatternParam;
    }
    & URLPatternParams<`/${rest}`>
  : URL extends `/:${infer param}?` ? {
      [key in param]?: URLPatternParam;
    }
  : URL extends `/:${infer param}` ? {
      [key in param]: URLPatternParam;
    }
  : URL extends `/*?` ? {
      "*"?: URLPatternParam | URLPatternParam[];
    }
  : URL extends `/*` ? {
      "*": URLPatternParam | URLPatternParam[];
    }
  : URL extends `/*${infer param}?` ? {
      [key in param]: URLPatternParam | URLPatternParam[];
    }
  : URL extends `/*${infer param}` ? {
      [key in param]: URLPatternParam | URLPatternParam[];
    }
  : URL extends `/${string}/${infer rest}` ? URLPatternParams<`/${rest}`>
  // deno-lint-ignore ban-types
  : {};
export type ClientOf<T> = {
  [key in (keyof T) & `${HttpVerb} /${string}`]: key extends
    `${HttpVerb} /${infer path}` ? T[key] extends {
      response?: infer ResBody;
      body: infer ReqBody;
      searchParams?: infer Params;
    } ? (
        params: URLPatternParams<`/${path}`> & Params,
        init: TypedRequestInit<ReqBody>,
      ) => Promise<TypedResponse<ResBody>>
    : T[key] extends {
      response?: infer ResBody;
      searchParams?: infer Params;
    } ? (
        params: URLPatternParams<`/${path}`> & Params,
        init?: Omit<RequestInit, "body">,
      ) => Promise<TypedResponse<ResBody>>
    : never
    : never;
};
export interface HttpClientOptions {
  base: string;
  headers?: Headers;
  processHeaders?: (headers?: Headers) => Headers | undefined;
  fetcher?: typeof fetch;
  // Keep empty segments in the URL
  keepEmptySegments?: boolean;
}

/**
 * Print a curl-like representation of the request for debugging
 */
function debugRequest(
  url: string,
  method: string,
  headers: Headers,
  body?: BodyInit | null,
): void {
  // if (!DEBUG_HTTP) return;
  console.log("Calling debugRequest for URL:", url);

  console.log("\n----- HTTP Request -----");
  console.log(`curl -X ${method} "${url}" \\`);

  // Add headers
  headers.forEach((value, key) => {
    const redacted = key.toLowerCase() === "authorization"
      ? "<redacted>"
      : value;
    console.log(`  -H "${key}: ${redacted}" \\`);
  });

  // Add body if present
  if (body) {
    if (typeof body === "string") {
      console.log(`  -d '${body.replace(/'/g, "\\'")}' \\`);
    } else if (body instanceof URLSearchParams) {
      console.log(`  -d '${body.toString().replace(/'/g, "\\'")}' \\`);
    } else if (body instanceof FormData) {
      console.log(`  -F "form data not displayed" \\`);
    } else {
      console.log(
        `  -d 'body of type ${body.constructor.name} not displayed' \\`,
      );
    }
  }

  console.log("  --compressed");
  console.log("-----------------------\n");
}

export const createHttpClient = <T>(
  {
    base: maybeBase,
    headers: defaultHeaders,
    processHeaders = (headers?: Headers) => headers,
    fetcher = fetchSafe,
    keepEmptySegments,
  }: HttpClientOptions,
): ClientOf<T> => {
  // Base should always endwith / so when concatenating with path we get the right URL
  const base = maybeBase.at(-1) === "/" ? maybeBase : `${maybeBase}/`;

  return new Proxy({} as ClientOf<T>, {
    get: (_target, prop) => {
      if (prop === Symbol.toStringTag || prop === Symbol.toPrimitive) {
        return `HttpClient: ${base}`;
      }
      if (typeof prop !== "string") {
        throw new TypeError(`HttpClient: Uknown path ${typeof prop}`);
      }
      const [method, path] = prop.split(" ");

      // @ts-expect-error if not inside, throws
      if (!HTTP_VERBS.has(method)) {
        throw new TypeError(`HttpClient: Verb ${method} is not allowed`);
      }
      return (
        params: Record<string, string | number | string[] | number[]>,
        init?: RequestInit & {
          excludeFromSearchParams?: string[];
          templateMarker?: string;
        },
      ) => {
        const mapped = new Map(Object.entries(params));
        const marker = init?.templateMarker ?? ":";
        const compiled = path
          .split("/")
          .flatMap((segment) => {
            const isTemplate = segment.at(0) === marker ||
              segment.at(0) === "*";
            const isRequired = segment.at(-1) !== "?";
            if (!isTemplate) {
              return segment;
            }

            const name = segment.slice(
              marker.length,
              !isRequired ? -1 : undefined,
            );

            const param = mapped.get(name);
            if (param === undefined && isRequired) {
              throw new TypeError(`HttpClient: Missing ${name} at ${path}`);
            }

            return param;
          })
          .filter((x) =>
            typeof x === "string"
              ? (keepEmptySegments || x.length)
              : typeof x === "number"
          )
          .join("/");

        const url = new URL(compiled, base);

        mapped.forEach((value, key) => {
          if (value === undefined) {
            return;
          }
          const arrayed = Array.isArray(value) ? value : [value];
          arrayed.forEach((item) => {
            if (!(init?.excludeFromSearchParams || []).includes(key)) {
              url.searchParams.append(key, `${item}`);
            }
          });
        });

        const isJSON = init?.body != null &&
          typeof init.body !== "string" &&
          !(init.body instanceof ReadableStream) &&
          !(init.body instanceof FormData) &&
          !(init.body instanceof URLSearchParams) &&
          !(init.body instanceof Blob) &&
          !(init.body instanceof ArrayBuffer);

        const headers = new Headers(init?.headers);
        defaultHeaders?.forEach((value, key) => headers.set(key, value));
        isJSON && headers.set("content-type", "application/json");

        const body = isJSON ? JSON.stringify(init.body) : init?.body;

        // Debug log if DEBUG_HTTP is enabled
        if (DEBUG_HTTP) {
          debugRequest(url.href, method, headers, body);
        }

        return fetcher(url.href, {
          ...init,
          headers: processHeaders(headers),
          method,
          body,
        });
      };
    },
  });
};
// deno-lint-ignore no-explicit-any
export const nullOnNotFound = (error: any) => {
  if (error.status === 404) {
    return null;
  }
  throw error;
};
