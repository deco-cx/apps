export { default } from "../../resend/mod.ts";

import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../resend/README.md", import.meta.url).href,
  );

  return {
    Component: markdownContent,
    props,
  };
};
