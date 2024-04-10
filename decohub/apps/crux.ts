import PreviewCrux from "../../crux/preview/Preview.tsx";

import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";
export { default } from "../../crux/mod.ts";

const CONFIG = {
  name: "Chrome User Experience Report",
  author: "deco.cx",
  description:
    "Measure your site traffic at a glance in a simple and modern web analytics dashboard.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/crux/logo.png",
  images: [],
};

export const preview = (props: AppRuntime) => {
  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [
          { title: "About", content: PreviewCrux },
        ],
      },
    },
  };
};
