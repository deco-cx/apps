export function ajustLimits(
  skip: number,
  take: number,
) {
  const newSkip = Math.max(skip, 0);
  const newTake = Math.min(newSkip + 100, take);

  return {
    skip: newSkip,
    take: newTake,
  };
}
