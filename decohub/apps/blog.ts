import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../blog/mod.ts";

const CONFIG = {
  name: "Deco Blog",
  author: "deco.cx",
  description: "Manage your posts.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
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
