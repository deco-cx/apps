import { AppContext } from "../mod.ts";

interface Props {
  headerRows: string[];
  values: string[];
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const { headerRows, values } = props;

  if (headerRows.length !== values.length) {
    throw new Error("The number of headers and values does not match.");
  }

  const rowObject = headerRows.reduce(
    (acc: { [key: string]: string }, header, index) => {
      acc[header] = values[index];
      return acc;
    },
    {},
  );

  console.log(rowObject);

  const sheet = await ctx.doc.addSheet({ headerValues: headerRows });
  const row = await sheet.addRow(rowObject);

  return row;
};

export default action;
