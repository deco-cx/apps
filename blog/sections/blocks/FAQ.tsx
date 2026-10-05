import { type Section } from "@deco/deco/blocks";
import { renderSection } from "../../../website/pages/Page.tsx";
import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

export interface FAQItem {
  /**
   * @title Question
   * @format rich-text
   */
  title: string;
  /**
   * @title Answer
   * @label hidden
   * @changeable true
   */
  body?: Section[];
}

export interface Props {
  faqId?: string;
  items: FAQItem[];
}

export default function FAQ({ faqId, items }: Props) {
  const list = Array.isArray(items) ? items : [];

  return (
    <div id={faqId} class="my-8 flex flex-col">
      {list.map((item, i) => (
        <details
          key={i}
          open={i === 0}
          class="group border-b border-line-subtle first:border-t first:border-line-subtle"
        >
          <summary class="flex items-start justify-between gap-4 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span
              class="text-[1.0625rem] font-semibold leading-snug [&_a]:text-accent [&_strong]:font-semibold [&_strong]:text-base"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}
            />
            <span
              class="flex-shrink-0 w-5 h-5 flex items-center justify-center text-accent mt-[2px] transition-transform group-open:rotate-180"
              aria-hidden="true"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </summary>
          <div class="pb-5 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {item.body?.map(renderSection)}
          </div>
        </details>
      ))}
    </div>
  );
}
