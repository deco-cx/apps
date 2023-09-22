import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../shopify/mod.ts";

export const Preview = await Markdown(
  new URL("../../shopify/README.md", import.meta.url).href,
);
