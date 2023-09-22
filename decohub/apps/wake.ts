import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../wake/mod.ts";

export const Preview = await Markdown(
  new URL("../../wake/README.md", import.meta.url).href,
);
