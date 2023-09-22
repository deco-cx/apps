import { AppContext } from "../../mod.tsx";

interface Props {
  taskID: number;
}

const action = async (props: Props, _req: Request, ctx: AppContext) => {
  const { clientForIndex } = ctx;
  const index = await clientForIndex("products");

  await index.waitTask(props.taskID);
};

export default action;
