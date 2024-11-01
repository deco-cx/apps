import type { JSX } from "preact";
import { PreviewContainer } from "../../utils/preview.tsx";
import { App } from "../mod.ts";
import { type AppRuntime, type BaseContext, Context } from "@deco/deco";

export interface Props {
  publicUrl: string;
}

export const PreviewWooCommerce = (
  app: AppRuntime<BaseContext, App["state"]> & {
    markdownContent: () => JSX.Element;
  },
) => {
  const context = Context.active();
  const _decoSite = context.site;
  const _publicUrl = app.state?.publicUrl || "";

  return (
    <PreviewContainer
      name="WooCommerce"
      owner="deco.cx"
      description="This document will help you set up the app and launch your WooCommerce store efficiently. The information is divided into three main sections: General Information, App Configuration, and Go Live Preparations. Follow each section carefully to ensure a successful integration."
      logo="https://raw.githubusercontent.com/deco-cx/apps/main/woocommerce/logo.png"
      images={[]}
    />
  );
};
