import { AppRuntime } from "deco/mod.ts";
import { Preview } from "../preview/Preview.tsx";

export { default } from "../../ai-assistants/mod.ts";

const CONFIG = {
  name: "Deco AI Assistant",
  author: "deco.cx",
  description: "Create AI assistants on deco.cx.",
  icon:
    "https://raw.githubusercontent.com/deco-cx/apps/main/ai-assistants/logo.png",
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
