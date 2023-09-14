import { AppContext } from "../../mod.ts";

interface Props {
  taskID: number;
}

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { algolia } = ctx;
  const index = await algolia("products");

  await index.waitTask(props.taskID);
};

export default action;
