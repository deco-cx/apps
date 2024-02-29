export { default } from "../../mailchimp/mod.ts";
import { Markdown } from "../components/Markdown.tsx";

export const Preview = await Markdown(
  new URL("../../mailchimp/README.md", import.meta.url).href,
);
