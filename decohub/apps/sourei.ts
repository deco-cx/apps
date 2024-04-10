import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../sourei/mod.ts";

const CONFIG = {
  name: "Sourei",
  author: "deco.cx",
  description: "Get sourei to analyze your data.",
  images: [],
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/sourei/logo.png",
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../sourei/README.md", import.meta.url).href,
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
