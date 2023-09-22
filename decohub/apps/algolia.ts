import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../algolia/mod.ts";

export const Preview = await Markdown(
  new URL("../../algolia/README.md", import.meta.url).href,
);
