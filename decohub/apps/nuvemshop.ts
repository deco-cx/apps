import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../nuvemshop/mod.ts";

export const Preview = await Markdown(
  new URL("../../nuvemShop/README.md", import.meta.url).href,
);
