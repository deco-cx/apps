import { AppContext } from "../../mod.ts";
import { Data, Variables, query } from "../../utils/queries/updateCustomer.ts";

type UpdateCustomerProps = {
  input: {
    id: string;
    tags: string[];
  };
};

const action = async (
  { input }: UpdateCustomerProps,
  _req: Request,
  ctx: AppContext,
): Promise<{id: string}> => {
  const { admin } = ctx;
  
  const { payload : {customer} }  = await admin.query<Data, Variables>({
    variables: { 
      input:{
        id: input.id,
        tags: input.tags,
      }
    },
    query,
  });

  return customer;
};

export default action;
