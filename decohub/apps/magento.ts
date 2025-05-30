import { AppRuntime } from "@deco/deco";
import { Markdown } from "../components/Markdown.tsx";
import { PreviewMagento } from "../../magento/preview/Preview.tsx";

export { default } from "../../magento/mod.ts";

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../magento/README.md", import.meta.url).href,
  );

  return {
    Component: PreviewMagento,
    props: {
      ...props,
      markdownContent,
    },
  };
};
