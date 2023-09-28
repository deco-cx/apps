import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../linx/mod.ts";

export const Preview = await Markdown(
  new URL("../../linx/README.md", import.meta.url).href,
);
