import { nullOnNotFound } from "../../../utils/http.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  ExtendedProperties?: {
    Name: string
    Value: unknown
    Values: unknown[]
  }[]
  WishlistID?: number
  CustomerID: number
  IsActive: boolean
  Name: string
  Description: string
  PrivacyType: '0 - Public' | '2 - Private'
  Hash?: string
  Password?: string
  CreatedDate?: string
  ModifiedDate?: string
  DeliveryAddressID?: number
  EndPurchaseDate?: string
  PurchasingBehavior?: string
  WishlistDefinitionID?: number
}

const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<unknown | null> => {
  const { layer } = ctx;

  const response = await layer["POST /v1/Profile/API.svc/web/SaveWishlist"](
    {},
    {
      body: props,
    }
  );

  const data = await response.json().catch(nullOnNotFound);

  if (!data) {
    return null;
  }

  return data;
};

export default action;
