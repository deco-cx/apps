import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  html?: string;
  text?: string;
  /**
   * @description Render inside a <div> instead of a <p>. Use for rich content
   * that carries its own block-level markup (lists, headings, several
   * paragraphs) — a <p> is auto-closed by the browser at the first block-level
   * start tag, which drops the typography from everything after it.
   */
  block?: boolean;
}

const CLASS =
  "text-[1.0625rem] leading-[1.75] break-words [text-wrap:pretty] [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:decoration-[1px] hover:[&_a]:decoration-[2px] [&_strong]:font-semibold [&_strong]:text-base";

export default function Paragraph({ html, text, block }: Props) {
  const __html = sanitizeHtml(html ?? text ?? "");

  return block
    ? <div class={CLASS} dangerouslySetInnerHTML={{ __html }} />
    : <p class={CLASS} dangerouslySetInnerHTML={{ __html }} />;
}
