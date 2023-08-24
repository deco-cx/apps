import { fetchSafe } from "../../utils/fetch.ts";

interface Props {
  /**
   * @description Asset src like: https://fonts.gstatic.com/...
   */
  src: string;
}

const loader = async (props: Props) => {
  const original = await fetchSafe(props.src, {
    deco: { cache: "stale-while-revalidate" },
  });

  const response = original.clone();
  response.headers.set(
    "cache-control",
    "public, s-maxage=15552000, max-age=15552000, immutable",
  );

  return response;
};

export default loader;
