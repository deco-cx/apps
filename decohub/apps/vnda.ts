import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../vnda/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../vnda/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
