import { AppContext } from "../../mod.ts";
import { Indices } from "../../utils/product.ts";

interface Props {
  taskID: number;
}

const indexName: Indices = "products";

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { client } = ctx;

  await client.initIndex(indexName).waitTask(props.taskID);
};

export default action;
