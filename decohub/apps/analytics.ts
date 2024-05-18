import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../analytics/mod.ts";

const CONFIG = {
  name: "Deco Analytics",
  author: "deco.cx",
  description:
    "Measure your site traffic at a glance in a simple and modern web analytics dashboard.",
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/analytics/logo.png",
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
