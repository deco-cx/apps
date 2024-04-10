import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../power-reviews/mod.ts";

const CONFIG = {
  name: "Power Reviews",
  author: "deco.cx",
  description:
    "Collect more and better Ratings & Reviews and other UGC. Create UGC displays that convert. Analyze to enhance product experience and positioning",
  images: [],
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/power-reviews/logo.png",
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
