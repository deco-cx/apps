import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../vtex/mod.ts";

export const Preview = await Markdown(
  new URL("../../vtex/README.md", import.meta.url).href,
);
