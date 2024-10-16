export function dateInSeconds(date: string | Date) {
  return Math.floor(
    new Date(date).getTime() / 1000,
  );
}

function getDateFromSaoPauloTZ(date: string | Date) {
  const [day, month, year] = new Date(date)
    .toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
    .split(", ")?.[0]?.split("/");

  return { year, month, day };
}

export function isToday(date: string | Date) {
  const today = getDateFromSaoPauloTZ(new Date());
  const _date = getDateFromSaoPauloTZ(new Date(date));

  return _date.day === today.day &&
    today.month === _date.month &&
    today.year === _date.year;
}
