import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";
import { SaveWishlistResponse } from "../../utils/types/wishlistJSON.ts";

export interface Props {
  ExtendedProperties?: {
    Name: string;
    Value: unknown;
    Values: unknown[];
  }[];
  IsActive: boolean;
  Name: string;
  Description: string;
  PrivacyType?: "0 - Public" | "2 - Private";
  Hash?: string;
  Password?: string;
  CreatedDate?: string;
  ModifiedDate?: string;
  DeliveryAddressID?: number;
  EndPurchaseDate?: string;
  PurchasingBehavior?: string;
  WishlistDefinitionID?: number;
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SaveWishlistResponse | null> => {
  const { layer } = ctx;

  const user = await ctx.invoke.linx.loaders.user();

  if (!user) {
    return null;
  }

  const { CustomerID } = user;

  if (!CustomerID) {
    return null;
  }

  const response = await layer["POST /v1/Profile/API.svc/web/SaveWishlist"](
    {},
    {
      body: {
        ...props,
        CustomerID,
      },
    },
  );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;
