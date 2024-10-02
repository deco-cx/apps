export function resourceRange(
  skip: number,
  take: number,
) {
  const from = Math.max(skip, 0);
  const to = from + Math.min(100, take);

  return {
    from,
    to,
  };
}
