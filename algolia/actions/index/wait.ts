import { INDEX_NAME } from "../../loaders/product/list.ts";
import { AppContext } from "../../mod.ts";

interface Props {
  taskID: number;
  indexName?: string;
}

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { client } = ctx;
  const { indexName = INDEX_NAME } = props;

  await client.initIndex(indexName).waitTask(props.taskID);
};

export default action;
