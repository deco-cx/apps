export function ajustLimits(
  skip: number,
  take: number,
  size = 100,
) {
  const newSkip = Math.max(skip, 0);
  const newTake = Math.min(newSkip + size, take);

  return {
    skip: newSkip,
    take: newTake,
  };
}
