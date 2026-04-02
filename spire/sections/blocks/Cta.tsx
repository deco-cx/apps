import { sanitizeHref } from "../../utils/sanitizeHtml.ts";

export interface Props {
  text: string;
  href?: string;
}

export default function Cta({ text, href }: Props) {
  const safeHref = sanitizeHref(href);
  const isExternal = /^https?:\/\//i.test(safeHref);
  return (
    <div class="my-8 text-center">
      <a
        href={safeHref}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        class="inline-block py-[0.75em] px-[2em] rounded-full bg-accent text-inverted font-semibold text-sm tracking-[0.02em] no-underline transition-opacity hover:opacity-85"
      >
        {text}
      </a>
    </div>
  );
}
