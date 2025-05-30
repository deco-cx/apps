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
  totalPriceSet: TotalPriceSet;
  paymentCollectionDetails: PaymentCollectionDetails;
  events: Events;
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
