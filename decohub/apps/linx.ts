import { AppRuntime } from "deco/mod.ts";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../linx/mod.ts";

const CONFIG = {
  name: "Linx",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Linx Commerce Platform to your website.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/linx/logo.png",
  images: [],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../linx/README.md", import.meta.url).href,
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
