import { AppRuntime } from "deco/mod.ts";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../htmx/mod.ts";

const CONFIG = {
  name: "HTMX",
  author: "deco.cx",
  description: "high power tools for HTML",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/htmx/logo.png",
  images: [],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../htmx/README.md", import.meta.url).href,
  );

  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [
          { title: "About", content: markdownContent },
        ],
      },
    },
  };
};
