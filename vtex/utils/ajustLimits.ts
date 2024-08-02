export function ajustLimits(
  start: number,
  end: number,
  offset: number,
) {
  const newStart = start > 0 ? start : 0;
  const newEnd = (end - newStart > offset) ? newStart + offset : end;

  return {
    start: newStart,
    end: newEnd,
  };
}
