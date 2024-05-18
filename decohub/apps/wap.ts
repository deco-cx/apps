import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../wap/mod.ts";

const CONFIG = {
  name: "Wap",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Wap Commerce Platform to your website.",
  images: [],
};

export const preview = (props: AppRuntime) => {
  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [],
      },
    },
  };
};
