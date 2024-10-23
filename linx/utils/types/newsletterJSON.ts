import { NavigationInfo, ResponseCallBack } from "./shared.ts";

export interface NewsletterResponse {
  Response: Response;
  Model: Model;
  PageInfo: PageInfo;
  PageParameters: unknown;
}

export interface Model {
  Navigation: NavigationInfo[];
}

export interface PageInfo {
  AlternateTitle: null;
  BodyClass: null;
  CanonicalLink: string;
  CanonicalNextLink: string;
  CanonicalPrevLink: string;
  DefaultAlternateTitle: string;
  DefaultDescription: null;
  DefaultMetaDescription: string;
  DefaultMetaKeywords: string;
  DefaultPageTitle: string;
  Description: null;
  HttpStatusCode: number;
  IndexPage: boolean;
  MetaDescription: null;
  MetaKeywords: null;
  PageTitle: string;
  RouteClass: string;
  SectionClass: null;
}

export interface Response {
  Custom: unknown;
  Errors: unknown[];
  IsValid: boolean;
  RefreshBasket: boolean;
  ResponseCallBack: ResponseCallBack;
  SuccessMessage: null;
  Url: null;
  Warnings: unknown[];
}
