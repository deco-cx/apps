import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../implementation/mod.ts";

const CONFIG = {
  name: "Implementer",
  author: "deco.cx",
  description: "The agency that's implementing your store",
  images: [],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../implementation/README.md", import.meta.url).href,
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
