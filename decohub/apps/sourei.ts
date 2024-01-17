import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../sourei/mod.ts";

export const Preview = await Markdown(
  new URL("../../sourei/README.md", import.meta.url).href,
);
