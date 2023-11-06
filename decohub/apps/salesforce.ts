import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../salesforce/mod.ts";

export const Preview = await Markdown(
  new URL("../../salesforce/README.md", import.meta.url).href,
);
