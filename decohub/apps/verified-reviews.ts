import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../verified-reviews/mod.ts";

const CONFIG = {
  name: "Verified Reviews",
  author: "deco.cx",
  description: "A specialized solution in the collection of customer reviews",
  images: [],
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/verified-reviews/logo.png",
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
