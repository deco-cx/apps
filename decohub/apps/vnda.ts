import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../vnda/mod.ts";

export const Preview = Markdown(
  new URL("../../vnda/README.md", import.meta.url).href,
);
