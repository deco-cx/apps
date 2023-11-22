import Handlebars from "https://esm.sh/v131/handlebars@4.7.8";
import { HTMLRenderer } from "../deps.ts";

const h = Handlebars as unknown as typeof Handlebars["export="];

export interface Props {
  /**
   * @format form-schema
   */
  schema: string;
  /**
   * @format template
   */
  template: string;
}

export default function CreateSection(props: Props) {
  const compiled = h.compile(props.template);

  return HTMLRenderer({ html: compiled(props.schema.formData) });
}
