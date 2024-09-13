export { default } from "../../vtex/mod.ts";
import { PreviewVtex } from "../../vtex/preview/Preview.tsx";
import { Markdown } from "../components/Markdown.tsx";
import { type AppRuntime } from "@deco/deco";
export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown(
    new URL("../../vtex/README.md", import.meta.url).href,
  );
  return {
    Component: PreviewVtex,
    props: {
      ...props,
      markdownContent,
    },
  };
};
