import { hardSanitize } from "../../utils/hardSanitize.ts";

export interface Props {
  /** JSON-encoded string[] — optional header row */
  headers?: string[] | string;
  /** JSON-encoded string[][] — body rows × cells */
  rows?: string[][] | string;
}

function parseHeaders(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.map((c) => String(c ?? ""));
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((c) => String(c ?? ""));
    } catch { /* ignore */ }
  }
  return [];
}

function parseRows(value: string[][] | string | undefined): string[][] {
  const toRow = (row: unknown): string[] =>
    Array.isArray(row) ? row.map((c) => String(c ?? "")) : [];

  if (Array.isArray(value)) return value.map(toRow);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(toRow);
    } catch { /* ignore */ }
  }
  return [];
}

export default function Table({ headers, rows }: Props) {
  const head = parseHeaders(headers);
  const body = parseRows(rows);

  if (head.length === 0 && body.length === 0) return null;

  const cellClass =
    "px-4 py-3 text-sm leading-normal align-top [&_a]:text-accent [&_a]:underline [&_strong]:font-semibold [&_strong]:text-base";

  return (
    <div class="my-8 border border-line rounded-brand overflow-x-auto">
      <table class="w-full border-collapse text-left">
        {head.length > 0 && (
          <thead>
            <tr class="bg-alt">
              {head.map((cell, i) => (
                <th
                  key={i}
                  class="px-4 py-3 text-xs font-semibold tracking-caps uppercase border-b-2 border-line"
                  dangerouslySetInnerHTML={{ __html: hardSanitize(cell) }}
                />
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {body.map((row, r) => (
            <tr key={r} class="border-b border-line-subtle last:border-b-0">
              {row.map((cell, c) => (
                <td
                  key={c}
                  class={cellClass}
                  dangerouslySetInnerHTML={{ __html: hardSanitize(cell) }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
