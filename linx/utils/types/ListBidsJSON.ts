<<<<<<< HEAD
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
=======
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

export type Bids=WebPage;
>>>>>>> 63c1a490ac3a45e8c1f20db5748f0a47d86104b4
