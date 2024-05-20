import { AppRuntime } from "deco/mod.ts";
import { Markdown } from "../decohub/components/Markdown.tsx";

export const previewFromMarkdown = (url: string) => {
  return async (props: AppRuntime) => {
    const markdownContent = await Markdown(
      new URL(url, import.meta.url).href,
    );

    return {
      Component: markdownContent,
      props,
    };
  };
};
