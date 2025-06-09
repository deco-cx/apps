export interface GetOrderDetails {
  data: Data;
  extensions: Extensions;
}

export interface GetOrderDetailsVariables {
  query: string;
}

export interface Data {
  orders: Orders;
}

export interface Orders {
  nodes: Node[];
}

export interface Node {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  displayFinancialStatus: string;
  customer: Customer;
  totalPriceSet: TotalPriceSet;
  paymentCollectionDetails: PaymentCollectionDetails;
  lineItems: LineItems;
  events: Events;
}

export interface Customer {
  firstName: string;
  lastName: string;
}

export interface LineItems {
  edges: LineItemEdge[];
}

export interface LineItemEdge {
  node: LineItemNode;
}

export interface LineItemNode {
  id: string;
  title: string;
  quantity: number;
  sku?: string;
  variantTitle: string;
  discountedUnitPriceAfterAllDiscountsSet:
    DiscountedUnitPriceAfterAllDiscountsSet;
}

export interface TotalPriceSet {
  presentmentMoney: PresentmentMoney;
}

export interface PresentmentMoney {
  amount: string;
  currencyCode: string;
}

export interface PaymentCollectionDetails {
  additionalPaymentCollectionUrl: string;
}

export interface Events {
  edges: Edge[];
}

export interface Edge {
  cursor: string;
  node: TimelineEvent;
}

export interface TimelineEvent {
  id: string;
  createdAt: string;
  criticalAlert: boolean;
  message: string;
  action: string;
  attributeToApp: boolean;
  attributeToUser: boolean;
  additionalContent: string;
}

export interface Extensions {
  cost: Cost;
}

export interface Cost {
  requestedQueryCost: number;
  actualQueryCost: number;
  throttleStatus: ThrottleStatus;
}

export interface ThrottleStatus {
  maximumAvailable: number;
  currentlyAvailable: number;
  restoreRate: number;
}

export interface DiscountedUnitPriceAfterAllDiscountsSet {
  presentmentMoney: PresentmentMoney;
  shopMoney: ShopMoney;
}

export interface PresentmentMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopMoney {
  amount: string;
  currencyCode: string;
}
