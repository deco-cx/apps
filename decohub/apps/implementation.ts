import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../implementation/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../implementation/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
