export interface PageReview {
    HasErrors:   boolean;
    Element:     Element;
    ErrorList:   any[];
    Total:       number;
    CurrentPage: number;
    Pagination:  Pagination;
  }
  
  export interface Element {
    IdProduct:          null;
    YourviewsIdProduct: number;
    Rating:             number;
    TotalRatings:       number;
    ReviewBattle:       ReviewBattle;
    Filters:            Filter[];
    Reviews:            Review[];
    RatingHistogram:    RatingHistogram;
    FieldSummary:       FieldSummary;
    Recommend:          Recommend;
    Keywords:           Keywords;
  }
  
  export interface FieldSummary {
    FieldList: FieldList[];
  }
  
  export interface FieldList {
    FieldTitle:   FieldTitleEnum;
    Total:        number;
    TotalReviews: number;
    Average:      number;
  }
  
  export enum FieldTitleEnum {
    Acabamento = "Acabamento",
    CustoBenefício = "Custo Benefício",
    Qualidade = "Qualidade",
    VocêCosturaPor = "Você costura por:",
    VocêRecomendariaEsseProdutoAUmAmigo = "Você recomendaria esse produto a um amigo?",
  }
  
  export interface Filter {
    Name:         FieldTitleEnum;
    FilterId:     number;
    FilterValues: FilterValue[];
  }
  
  export interface FilterValue {
    FilterValueId: number;
    Count:         number;
    Name:          NameElement;
    ValueAsInt:    number;
  }
  
  export enum NameElement {
    BOM = "Bom",
    Excelente = "Excelente",
    FonteDeRenda = "Fonte de Renda",
    Lazer = "Lazer",
    Sim = "Sim",
  }
  
  export interface Keywords {
    HasResults:  boolean;
    KeywordList: null;
  }
  
  export interface RatingHistogram {
    RatingList: RatingList[];
  }
  
  export interface RatingList {
    Rate:          number;
    Total:         number;
    TotalReviews:  number;
    PercentRating: number;
  }
  
  export interface Recommend {
    TotalReviews:     number;
    Recommend:        number;
    DontRecommend:    number;
    RecommendPercent: number;
  }
  
  export interface ReviewBattle {
    BestReview:  null;
    WorstReview: null;
    HasResults:  boolean;
  }
  
  export interface Review {
    ReviewId:       number;
    Rating:         number;
    Review:         string;
    Date:           Date;
    Likes:          number;
    Dislikes:       number;
    CustomFields:   CustomField[];
    User:           User;
    Product:        null;
    ReferenceOrder: null;
    CustomerPhotos: null;
    ReviewTitle:    null;
    BoughtProduct:  boolean;
    Origin:         null;
    StoreComments:  any[];
    CustomerVideos: any[];
  }
  
  export interface CustomField {
    Name:   FieldTitleEnum;
    Values: NameElement[];
  }
  
  export interface User {
    YourviewsUserId: number;
    Name:            string;
    Email:           null;
    CPF:             null;
    City:            null;
    State:           null;
    ZipCode:         null;
    IPAddress:       null;
    UserId:          null;
    ExhibitionName:  string;
    Avatar:          null | string;
    Phone:           null;
  }
  
  export interface Pagination {
    PageCount:       number;
    TotalItemCount:  number;
    PageNumber:      number;
    PageSize:        number;
    HasPreviousPage: boolean;
    HasNextPage:     boolean;
    IsFirstPage:     boolean;
    IsLastPage:      boolean;
    FirstItemOnPage: number;
    LastItemOnPage:  number;
  }