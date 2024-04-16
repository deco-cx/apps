import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../linx-impulse/mod.ts";

const CONFIG = {
  name: "Linx Impulse",
  author: "deco.cx",
  description:
    "Build, manage and deliver B2B, B2C and Marketplace commerce experiences.",
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/linx-impulse/logo.png",
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
