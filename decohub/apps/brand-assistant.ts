import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../brand-assistant/mod.ts";

const CONFIG = {
  name: "Deco Brand Assistant",
  author: "deco.cx",
  description: "A concierge for your ecommerce.",
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/brand-assistant/logo.png",
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
