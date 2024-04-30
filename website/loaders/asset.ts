import { shortcircuit } from "deco/engine/errors.ts";
import { fetchSafe, STALE } from "../../utils/fetch.ts";

interface Props {
  /**
   * @description Asset src like: https://fonts.gstatic.com/...
   */
  src: string;
}

const loader = async (props: Props) => {
  const url = new URL(props.src);

  if (url.protocol === "file:") {
    shortcircuit(new Response("Forbidden", { status: 403 }));
  }

  const original = await fetchSafe(url.href, STALE);

  const response = new Response(original.clone().body, original);
  response.headers.set(
    "cache-control",
    "public, s-maxage=15552000, max-age=15552000, immutable",
  );

  return response;
};

export default loader;
