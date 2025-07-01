import { AppContext } from "../../mod.ts";
import {
  CriarContatoModelRequest,
  CriarContatoModelResponse,
} from "../../types.ts";

export type Props = CriarContatoModelRequest;

/**
 * @title Create Contact
 * @description Creates a new contact
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CriarContatoModelResponse> => {
  try {
    const response = await ctx.api["POST /contatos"]({}, {
      body: props,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create contact: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

export default action;
