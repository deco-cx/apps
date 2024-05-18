import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../typesense/mod.ts";

const CONFIG = {
  name: "TypeSense",
  author: "deco.cx",
  description:
    "Open source search engine meticulously engineered for performance & ease-of-use.",
  images: [],
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/typesense/logo.png",
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../typesense/README.md", import.meta.url).href,
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
