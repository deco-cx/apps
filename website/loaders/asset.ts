import { fetch, forbidden } from "@deco/deco";
import {
  type DecoRequestInit,
  retryExceptionOr500,
  STALE,
} from "../../utils/fetch.ts";
import { HttpError } from "../../utils/http.ts";
import { AppContext } from "../mod.ts";
import { fetchPublicUrl, parsePublicUrl } from "../utils/publicUrl.ts";

const httpErrorResponse = (error: unknown) => {
  if (!(error instanceof HttpError)) throw error;
  return new Response(error.message, { status: error.status });
};

const fetchWithRetry = (input: URL, init: DecoRequestInit) =>
  retryExceptionOr500.execute(() => fetch(input, init));

interface Props {
  /**
   * @description Asset src like: https://fonts.gstatic.com/...
   */
  src: string;
}

const loader = async (
  props: Props,
  request: Request,
  ctx: AppContext,
): Promise<Response> => {
  if (ctx.disableProxy) {
    return new Response("Proxy disabled", { status: 403 });
  }

  let url: URL;
  try {
    url = parsePublicUrl(props.src);
  } catch (error) {
    return httpErrorResponse(error);
  }

  if (
    ctx.whitelistPatterns &&
    ctx.whitelistPatterns.length > 0 &&
    !ctx.whitelistPatterns.some((pattern) => pattern.test(url))
  ) {
    return new Response("Proxy disabled for this source", { status: 403 });
  }

  let original: Response;
  try {
    original = await fetchPublicUrl(url, { ...STALE }, {
      fetcher: fetchWithRetry,
    });
  } catch (error) {
    return httpErrorResponse(error);
  }

  if (!original.ok) {
    await original.body?.cancel();
    throw new HttpError(original.status);
  }
  const response = new Response(original.body, original);

  // Check if the request's Accept header includes "text/html"
  const acceptHeader = request.headers.get("accept");
  if (acceptHeader && acceptHeader.includes("text/html")) {
    forbidden({
      message: "Forbidden: text/html not accepted",
    });
  }

  const contentType = response.headers.get("Content-Type");
  if (contentType && contentType.includes("text/html")) {
    forbidden({
      message: "Forbidden: text/html not accepted as a response",
    });
  }

  // Set strict Content-Security-Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'unsafe-inline'",
  );

  // Set cache control headers
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=15552000, max-age=15552000, immutable",
  );

  return response;
};

export default loader;
