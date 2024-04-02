import { AppRuntime } from "deco/mod.ts";
export { default } from "../../page-builder/mod.ts";
import Preview from "../../page-builder/preview/index.tsx";

export const preview = (props: AppRuntime) => {
  return {
    Component: Preview,
    props,
  };
};
