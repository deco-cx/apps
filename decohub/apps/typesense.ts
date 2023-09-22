import { Markdown } from "../components/Markdown.tsx";

export { default } from "../../typesense/mod.ts";

export const Preview = Markdown(
  new URL("../../typesense/README.md", import.meta.url).href,
);
