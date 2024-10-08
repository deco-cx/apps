import { AppContext } from "../mod.ts";

/**
 * @title {{{key}}}
 */
export interface MetafieldsIdentifier {
  namespace: string;
  key: string;
}

export interface MetafieldsProps {
  identifiers?: MetafieldsIdentifier[];
}

const loader = async (
  props: MetafieldsProps,
  _req: Request,
  _ctx: AppContext,
): Promise<MetafieldsIdentifier[]> => {
  return await props.identifiers || [];
};

export default loader;
