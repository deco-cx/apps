import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../shopify/mod.ts";

const CONFIG = {
  name: "Shopify",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Shopify Commerce Platform to your website.",
  images: [],
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/shopify/logo.png",
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../shopify/README.md", import.meta.url).href,
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
