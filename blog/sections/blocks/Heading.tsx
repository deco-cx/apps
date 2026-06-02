import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  text: string;
  level?: string;
}

const styles: Record<string, string> = {
  h2:
    "font-display font-semibold text-2xl tracking-snug leading-tight mt-10 mb-4 break-words [text-wrap:balance] uppercase",
  h3:
    "font-display font-semibold text-xl tracking-snug leading-snug mt-8 mb-3 break-words [text-wrap:balance] uppercase",
  h4:
    "font-display font-semibold text-lg leading-snug mt-7 mb-2 break-words uppercase",
};

export default function Heading({ text, level }: Props) {
  const tag = (level === "3" || level === "h3")
    ? "h3"
    : (level === "4" || level === "h4")
    ? "h4"
    : "h2";

  const cls = styles[tag] ?? styles.h2;

  const safe = sanitizeHtml(text);
  if (tag === "h3") {
    return <h3 class={cls} dangerouslySetInnerHTML={{ __html: safe }} />;
  }
  if (tag === "h4") {
    return <h4 class={cls} dangerouslySetInnerHTML={{ __html: safe }} />;
  }
  return <h2 class={cls} dangerouslySetInnerHTML={{ __html: safe }} />;
}
