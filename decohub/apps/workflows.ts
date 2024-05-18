import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../workflows/mod.ts";

const CONFIG = {
  name: "Deco Workflows",
  author: "deco.cx",
  description: "Build customized and automated tasks.",
  images: [],
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/workflows/logo.png",
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
