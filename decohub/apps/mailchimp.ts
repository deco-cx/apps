export { default } from "../../mailchimp/mod.ts";
import { Markdown } from "../components/Markdown.tsx";
import { AppRuntime } from "deco/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../mailchimp/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
