import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

export { default } from "../../vnda/mod.ts";

const CONFIG = {
  name: "VNDA",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding VNDA Commerce Platform to your website.",
  images: [],
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/vnda/logo.png",
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../vnda/README.md", import.meta.url).href,
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
