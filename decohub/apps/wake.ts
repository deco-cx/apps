import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../wake/mod.ts";

const CONFIG = {
  name: "Wake",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Wake Commerce Platform to your website.",
  images: [],
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/wake/logo.png",
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../wake/README.md", import.meta.url).href,
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
