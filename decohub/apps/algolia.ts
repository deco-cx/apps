import { AppRuntime } from "deco/mod.ts";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../algolia/mod.ts";

const CONFIG = {
  name: "Algolia",
  author: "deco.cx",
  description:
    "Product search & discovery that increases conversions at scale.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/algolia/logo.png",
  images: [],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../algolia/README.md", import.meta.url).href,
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
