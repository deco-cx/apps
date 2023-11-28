import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../implementation/mod.ts";

export const Preview = await Markdown(
  new URL("../../implementation/README.md", import.meta.url).href,
);
