import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface Props {
  items: string;
  style?: "ordered" | "unordered";
}

export default function List({ items, style }: Props) {
  const entries = items.split("\n").filter(Boolean);
  const ordered = style === "ordered";

  const baseClass = "pl-6 my-4 text-[1.0625rem] leading-[1.75] space-y-2";

  if (ordered) {
    return (
      <ol class={`list-decimal ${baseClass}`}>
        {entries.map((item, i) => (
          <li
            key={i}
            class="pl-1.5 marker:text-muted [&_a]:text-accent [&_strong]:font-semibold [&_strong]:text-base"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}
          />
        ))}
      </ol>
    );
  }

  return (
    <ul class={`list-disc ${baseClass}`}>
      {entries.map((item, i) => (
        <li
          key={i}
          class="pl-1.5 marker:text-muted [&_a]:text-accent [&_strong]:font-semibold [&_strong]:text-base"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(item) }}
        />
      ))}
    </ul>
  );
}
