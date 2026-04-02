import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  html?: string;
  text?: string;
}

export default function Paragraph({ html, text }: Props) {
  return (
    <p
      class="text-[1.0625rem] leading-[1.75] break-words [text-wrap:pretty] [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-[3px] [&_a]:decoration-[1px] hover:[&_a]:decoration-[2px] [&_strong]:font-semibold [&_strong]:text-base"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html ?? text ?? "") }}
    />
  );
}
