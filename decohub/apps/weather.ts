import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../weather/mod.ts";

const CONFIG = {
  name: "Deco Weather",
  author: "deco.cx",
  description:
    "Vary your content based on the current weather of your visitors.",
  images: [],
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/weather/logo.png",
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
