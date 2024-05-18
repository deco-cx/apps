import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
import PreviewNuvemshop from "../../nuvemshop/preview/index.tsx";

export { default } from "../../nuvemshop/mod.ts";

const CONFIG = {
  name: "Nuvemshop",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Nuvemshop Commerce Platform to your website.",
  images: [],
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/nuvemshop/logo.png",
};

export const preview = (props: AppRuntime) => {
  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [
          { title: "About", content: PreviewNuvemshop },
        ],
      },
    },
  };
};
