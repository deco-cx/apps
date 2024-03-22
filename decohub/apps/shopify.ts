import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../shopify/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../shopify/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
