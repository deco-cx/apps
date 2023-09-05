export const batch = <T>(array: T[], size: number): T[][] => {
  const batched: T[][] = [];

  for (let it = 0; it * size < array.length; it++) {
    batched.push(array.slice(it * size, (it + 1) * size));
  }

  return batched;
};