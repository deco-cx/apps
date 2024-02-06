export { default } from "../../vtex/mod.ts";

import { AppRuntime } from "deco/types.ts";
import { PreviewVtex } from "../../vtex/preview/Preview.tsx";
import { Markdown } from "../components/Markdown.tsx";

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
