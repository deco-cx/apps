import { AvailableOption } from "../availableOptions.ts";

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
