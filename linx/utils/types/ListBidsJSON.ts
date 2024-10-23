export interface WebPage {
  Bids: Bid[];
  MustRefresh: boolean;
}

export interface Bid {
  Amount: number;
  BidAmountMultiplier: number;
  CreatedDate: Date;
  CustomerMaskedName: string;
  CustomerState: string;
  IsManual: boolean;
  IsWinning: boolean;
  ProductAuctionBidID: number;
}

export type Bids = WebPage["Bids"];
