import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../linx/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../linx/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
