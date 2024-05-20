import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";

export const previewFromMarkdown = (url: URL) => {
  return async (props: AppRuntime) => {
    const markdownContent = await Markdown(
      url.href,
    );

    return {
      Component: markdownContent,
      props,
    };
  };
};
