import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../vtex/mod.ts";

export const Preview = Markdown(
  new URL("../../vtex/README.md", import.meta.url).href,
);
