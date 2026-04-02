import { sanitizeHtml } from "../../utils/sanitizeHtml.ts";

const ICONS: Record<string, string> = {
  info: "ℹ",
  tip: "✓",
  warning: "⚠",
  product: "★",
};

type VariantStyle = { wrapper: string; header: string; icon: string };

const VARIANT: Record<string, VariantStyle> = {
  info: {
    wrapper: "border-blue-500 bg-blue-50",
    header: "text-blue-600",
    icon: "text-blue-500",
  },
  tip: {
    wrapper: "border-green-500 bg-green-50",
    header: "text-green-700",
    icon: "text-green-600",
  },
  warning: {
    wrapper: "border-amber-400 bg-amber-50",
    header: "text-amber-700",
    icon: "text-amber-500",
  },
  product: {
    wrapper: "border-accent bg-accent/[0.06]",
    header: "text-accent",
    icon: "text-accent",
  },
};

export interface Props {
  title?: string;
  body?: string;
  variant?: "info" | "tip" | "warning" | "product";
}

export default function Callout({ title, body, variant = "info" }: Props) {
  const v = VARIANT[variant] ?? VARIANT.info;

  return (
    <div class={`py-5 px-7 border-l-[3px] rounded-brand-sm my-6 ${v.wrapper}`}>
      {(title || variant) && (
        <div class={`flex items-center gap-2 mb-2.5 ${v.header}`}>
          <span
            class={`text-sm font-bold leading-none ${v.icon}`}
            aria-hidden="true"
          >
            {ICONS[variant] ?? "ℹ"}
          </span>
          {title && (
            <strong class="text-xs font-semibold tracking-caps uppercase">
              {title}
            </strong>
          )}
        </div>
      )}
      {body && (
        <div
          class="text-[1.0625rem] leading-normal [&>*+*]:mt-2 [&_a]:text-accent [&_a]:underline [&_strong]:font-semibold [&_strong]:text-base"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(body) }}
        />
      )}
    </div>
  );
}
