import { AvailableOption } from "./availableOptions.ts";

export interface BrowsingImage {
  Attributes: unknown[];
  HasMediaPath: boolean;
  Height: number;
  Index: number;
  MaxHeight: number;
  MaxWidth: number;
  MediaPath: string;
  MediaSizeType: string;
  MediaType: string;
  ProductPath: string;
  Title: null;
  Url: null;
  VariationPath: string;
  Width: number;
}

export interface CategoryItem {
  ID: string;
  Name: string;
  ParentID: string;
}

export interface LinxError {
  ErrorMessage: string;
  ErrorCode: string | null;
}

export interface Facet {
  Alias: string;
  AvailableOptions: AvailableOption[];
  DatesFacets: null;
  Facet: string;
  FieldName: string;
  InitClosed: boolean;
  LabelPattern: string;
  LabelPatternEnd: string;
  LabelPatternRange: string;
  LabelPatternStart: string;
  Layout: null;
  Limit: number | null;
  MaxOptions: number | null;
  MinOptions: null;
  MinRange: null;
  Name: string;
  Offset: null;
  ParameterPatternFormatted: string;
  Prefix: null;
  Priority: number;
  PropertyDisplayName: string | null;
  PropertyMetadataID: number;
  SearchFacetID: number;
  SelectedOptions: AvailableOption[];
  Selection: string;
  ShowEmptyFacets: boolean;
  ShowGroupMetadataOptions: boolean;
  Sort: string;
  Stats: null;
  UrlPattern: string;
  UrlPatternEnd: string;
  UrlPatternRange: string;
  UrlPatternStart: string;
  WidgetName: string;
  WidgetProperties: null;
}

export interface Tag {
  Label: string;
  TagID: number;
}

export interface SortOption {
  Alias: string;
  Label: string;
  Selected: boolean;
}

export interface Spell {
  Collation: string;
  Options: unknown[];
}

export interface LinxMetadata {
  Alias: string;
  Color: null | string;
  GroupName: null | string;
  GroupType: string;
  ImagePath: null | string;
  Name: string;
  Order: number;
  PropertyMetadataID: number;
  PropertyPath: string;
  Reference: null | string;
  Title: string;
  Value: string;
  ValueAlias: string;
}
export interface NavigationInfo {
  CustomUrl: null;
  Depth: number;
  ID: number;
  Text: string;
  Url: string;
  UrlFriendly: string;
}

export interface ProductDefinition {
  IsJoinable: boolean;
  JoinDisplayText: null;
  JoinProductBehavior: number;
  JoinPropertyMetadataID: null;
  JoinStockKeepUnitPatternLength: null;
  ProductDefinitionID: number;
}
export type Path = "/";

export interface ProductSelection {
  PropertyLevel: number;
  PropertyPath: Path;
  Quantity: number;
  SkuID: number;
}

export interface ProductSelectionItem {
  PropertyLevel: number;
  PropertyPath: string;
  Quantity: number;
  SkuID: number;
}

export interface PropertyItem {
  Color: null | string;
  GroupName: null;
  HasItems: boolean;
  ImagePath: null | string;
  IsSelected: boolean;
  OptionID: number;
  Order: number;
  PropertyPath: string;
  Reference: null;
  Text: string;
  Value: string;
}

export interface ProviderCapabilities {
  CanFacet: boolean;
  CanPage: boolean;
  CanSort: boolean;
  CanSpell: boolean;
  CanTerm: boolean;
  Provider: string;
}

export interface ResponseCallBack {
  Code: string;
  Parameters: unknown[];
  Value: string;
}

export interface SellerInfo {
  SellerID: number;
  SellerName: null;
}
