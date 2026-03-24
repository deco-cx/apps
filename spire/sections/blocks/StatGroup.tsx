type StatItem = { value: string; label: string };

export interface Props {
  /** JSON-encoded StatItem[] (max 3) */
  stats: string;
}

const GRID_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
};

export default function StatGroup({ stats }: Props) {
  let items: StatItem[] = [];
  try {
    const parsed = JSON.parse(stats ?? "[]");
    if (Array.isArray(parsed)) items = parsed;
  } catch { /* ignore */ }

  const clamped = items.slice(0, 3);
  const gridCols = GRID_CLASS[clamped.length] ?? GRID_CLASS[3];

  return (
    <div class={`grid gap-4 my-10 ${gridCols}`}>
      {clamped.map((stat, i) => (
        <div
          key={i}
          class="p-7 sm:p-8 border-[1.5px] border-line rounded-brand"
        >
          <div class="font-display text-[var(--text-4xl)] font-bold leading-none text-accent tracking-display mb-3 tabular-nums">
            {stat.value}
          </div>
          <div class="text-sm leading-normal [text-wrap:pretty]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
