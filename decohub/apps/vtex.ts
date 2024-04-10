export { default } from "../../vtex/mod.ts";

import { Context } from "deco/live.ts";
import { AppRuntime } from "deco/types.ts";
import { Preview } from "../preview/Preview.tsx";
import { PreviewMarkdown } from "../components/PreviewMarkdown.tsx";

import { GoLivePtBr } from "../../vtex/preview/Preview.tsx";

const CONFIG = {
  name: "Vtex",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Vtex Commerce Platform to your website.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/vtex/logo.png",
  images: [],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await PreviewMarkdown(
    new URL("../../vtex/README.md", import.meta.url).href,
  );

  const context = Context.active();
  const decoSite = context.site;
  //@ts-expect-error publicUrl exists on type
  const publicUrl = props.state?.publicUrl! || "";
  //@ts-expect-error account exists on type
  const account = props.state?.account || "";
  const withoutSubDomain = publicUrl.split(".").slice(1).join(".");

  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [
          { title: "About", content: markdownContent },
          {
            title: "Go live instructions",
            content: () => GoLivePtBr({ decoSite, withoutSubDomain, account }),
          },
        ],
      },
    },
  };
};
