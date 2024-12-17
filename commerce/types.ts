import { type Flag } from "@deco/deco";
/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
export declare type WithContext<T extends Things> = T & {
  "@context": "https://schema.org";
};
/**
 * An store category
 */
export interface Category {
  /**
   * @title The Category Name
   */
  name: string;
  /**
   * @title The Category Url
   */
  url: string;
  /**
   * @title Sub categories
   * @description Store's sub categories
   */
  children?: Category[];
}
export declare type Things = Thing | Product | BreadcrumbList;
export interface Thing {
  "@type": "Thing";
  /** IRI identifying the canonical address of this object. */
  "@id"?: string;
  /** An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. In RDFa syntax, it is better to use the native RDFa syntax - the 'typeof' attribute - for multiple types. Schema.org tools may have only weaker understanding of extra types, in particular those defined externally. */
  additionalType?: string;
  /** An alias for the item. */
  alternateName?: string;
  /** A description of the item. */
  description?: string;
  /** A sub property of description. A short description of the item used to disambiguate from other, similar items. Information from other properties (in particular, name) may be necessary for the description to be useful for disambiguation. */
  disambiguatingDescription?: string;
  /** The identifier property represents any kind of identifier for any kind of {@link https://schema.org/Thing Thing}, such as ISBNs, GTIN codes, UUIDs etc. Schema.org provides dedicated properties for representing many of these, either as textual strings or as URL (URI) links. See {@link /docs/datamodel.html#identifierBg background notes} for more details. */
  identifier?: string;
  /** An image of the item. This can be a {@link https://schema.org/URL URL} or a fully described {@link https://schema.org/ImageObject ImageObject}. */
  image?: ImageObject[] | null;
  video?: VideoObject[] | null;
  /** The name of the item. */
  name?: string;
  /** URL of a reference Web page that unambiguously indicates the item's identity. E.g. the URL of the item's Wikipedia page, Wikidata entry, or official website. */
  sameAs?: string;
  /** A CreativeWork or Event about this Thing. */
  subjectOf?: string;
  /** URL of the item. */
  url?: string;
}
export interface MediaObject {
  /** Media type typically expressed using a MIME format (see IANA site and MDN reference) */
  encodingFormat?: string;
  /** A URL pointing to a player for a specific video. */
  embedUrl?: string;
  /** Actual bytes of the media object, for example the image file or video file. */
  contentUrl?: string;
}
export interface CreativeWork {
  /** A thumbnail image relevant to the Thing */
  thumbnailUrl?: string;
}
export interface VideoObject
  extends MediaObject, CreativeWork, Omit<Thing, "@type" | "url"> {
  /**
   * @ignore
   */
  "@type": "VideoObject";
  /**
   * @description date when video was published first time, format ISO 8601: https://en.wikipedia.org/wiki/ISO_8601
   */
  uploadDate?: string;
  /**
   * @description video duration, format ISO 8601: https://en.wikipedia.org/wiki/ISO_8601,
   * PT00H30M5S means 30 minutes and 5 seconds
   */
  duration?: string;
}
export interface ImageObject
  extends MediaObject, CreativeWork, Omit<Thing, "@type" | "url"> {
  /**
   * @ignore
   */
  "@type": "ImageObject";
  /**
   * @format image-uri
   */
  url?: string;
}
export interface PropertyValue extends Omit<Thing, "@type"> {
  "@type": "PropertyValue";
  /** The upper value of some characteristic or property. */
  maxValue?: number;
  /** The lower value of some characteristic or property. */
  minValue?: number;
  /** A commonly used identifier for the characteristic represented by the property, e.g. a manufacturer or a standard code for a property. propertyID can be (1) a prefixed string, mainly meant to be used with standards for product properties; (2) a site-specific, non-prefixed string (e.g. the primary key of the property or the vendor-specific id of the property), or (3) a URL indicating the type of the property, either pointing to an external vocabulary, or a Web resource that describes the property (e.g. a glossary entry). Standards bodies should promote a standard prefix for the identifiers of properties from their standards. */
  propertyID?: string;
  /** The unit of measurement given using the UN/CEFACT Common Code (3 characters) or a URL. Other codes than the UN/CEFACT Common Code may be used with a prefix followed by a colon. */
  unitCode?: string;
  /** A string or text indicating the unit of measurement. Useful if you cannot provide a standard unit code for {@link unitCode unitCode}. */
  unitText?: string;
  /**
   * The value of the quantitative value or property value node.
   * - For {@link https://schema.org/QuantitativeValue QuantitativeValue} and {@link https://schema.org/MonetaryAmount MonetaryAmount}, the recommended type for values is 'Number'.
   * - For {@link https://schema.org/PropertyValue PropertyValue}, it can be 'Text;', 'Number', 'Boolean', or 'StructuredValue'.
   * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
   * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   */
  value?: string;
  /** A secondary value that provides additional information on the original value, e.g. a reference temperature or a type of measurement. */
  valueReference?: string;
}
export interface AggregateRating {
  "@type": "AggregateRating";
  /** The count of total number of ratings. */
  ratingCount?: number;
  /** The count of total number of reviews. */
  reviewCount?: number;
  /** The rating for the content. */
  ratingValue?: number;
  /** The highest value allowed in this rating system. */
  bestRating?: number;
  /** The lowest value allowed in this rating system. */
  worstRating?: number;
  /** A short explanation (e.g. one to two sentences) providing background context and other information that led to the conclusion expressed in the rating. This is particularly applicable to ratings associated with "fact check" markup using ClaimReview. */
  ratingExplanation?: string;
}
export declare type ItemAvailability =
  | "https://schema.org/BackOrder"
  | "https://schema.org/Discontinued"
  | "https://schema.org/InStock"
  | "https://schema.org/InStoreOnly"
  | "https://schema.org/LimitedAvailability"
  | "https://schema.org/OnlineOnly"
  | "https://schema.org/OutOfStock"
  | "https://schema.org/PreOrder"
  | "https://schema.org/PreSale"
  | "https://schema.org/SoldOut";
export declare type OfferItemCondition =
  | "https://schema.org/DamagedCondition"
  | "https://schema.org/NewCondition"
  | "https://schema.org/RefurbishedCondition"
  | "https://schema.org/UsedCondition";
export interface QuantitativeValue {
  value?: number;
}
export declare type PriceTypeEnumeration =
  | "https://schema.org/InvoicePrice"
  | "https://schema.org/ListPrice"
  | "https://schema.org/MinimumAdvertisedPrice"
  | "https://schema.org/MSRP"
  | "https://schema.org/SalePrice"
  | "https://schema.org/SRP";
export declare type PriceComponentTypeEnumeration =
  | "https://schema.org/ActivationFee"
  | "https://schema.org/CleaningFee"
  | "https://schema.org/DistanceFee"
  | "https://schema.org/Downpayment"
  | "https://schema.org/Installment"
  | "https://schema.org/Subscription";
export declare type ReturnFeesEnumeration =
  | "https://schema.org/FreeReturn"
  | "https://schema.org/OriginalShippingFees"
  | "https://schema.org/RestockingFees"
  | "https://schema.org/ReturnFeesCustomerResponsibility"
  | "https://schema.org/ReturnShippingFees";
export declare type ReturnMethodEnumeration =
  | "https://schema.org/KeepProduct"
  | "https://schema.org/ReturnAtKiosk"
  | "https://schema.org/ReturnByMail"
  | "https://schema.org/ReturnInStore";
export declare type MerchantReturnEnumeration =
  | "https://schema.org/MerchantReturnFiniteReturnWindow"
  | "https://schema.org/MerchantReturnNotPermitted"
  | "https://schema.org/MerchantReturnUnlimitedWindow"
  | "https://schema.org/MerchantReturnUnspecified";
export interface PriceSpecification extends Omit<Thing, "@type"> {
  "@type": "PriceSpecification";
  /** The interval and unit of measurement of ordering quantities for which the offer or price specification is valid. This allows e.g. specifying that a certain freight charge is valid only for a certain quantity. */
  eligibleQuantity?: QuantitativeValue;
  /**
   * The offer price of a product, or of a price component when attached to PriceSpecification and its subtypes.
   *
   * Usage guidelines:
   * - Use the {@link https://schema.org/priceCurrency priceCurrency} property (with standard formats: {@link http://en.wikipedia.org/wiki/ISO_4217 ISO 4217 currency format} e.g. "USD"; {@link https://en.wikipedia.org/wiki/List_of_cryptocurrencies Ticker symbol} for cryptocurrencies e.g. "BTC"; well known names for {@link https://en.wikipedia.org/wiki/Local_exchange_trading_system Local Exchange Tradings Systems} (LETS) and other currency types e.g. "Ithaca HOUR") instead of including {@link http://en.wikipedia.org/wiki/Dollar_sign#Currencies_that_use_the_dollar_or_peso_sign ambiguous symbols} such as '$' in the value.
   * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   * - Note that both {@link http://www.w3.org/TR/xhtml-rdfa-primer/#using-the-content-attribute RDFa} and Microdata syntax allow the use of a "content=" attribute for publishing simple machine-readable values alongside more human-friendly formatting.
   * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
   */
  price: number;
  /**
   * The currency of the price, or a price component when attached to {@link https://schema.org/PriceSpecification PriceSpecification} and its subtypes.
   *
   * Use standard formats: {@link http://en.wikipedia.org/wiki/ISO_4217 ISO 4217 currency format} e.g. "USD"; {@link https://en.wikipedia.org/wiki/List_of_cryptocurrencies Ticker symbol} for cryptocurrencies e.g. "BTC"; well known names for {@link https://en.wikipedia.org/wiki/Local_exchange_trading_system Local Exchange Tradings Systems} (LETS) and other currency types e.g. "Ithaca HOUR".
   */
  priceCurrency?: string;
}
export interface UnitPriceSpecification
  extends Omit<PriceSpecification, "@type"> {
  "@type": "UnitPriceSpecification";
  /** Identifies a price component (for example, a line item on an invoice), part of the total price for an offer. */
  priceComponentType?: PriceComponentTypeEnumeration;
  /** Defines the type of a price specified for an offered product, for example a list price, a (temporary) sale price or a manufacturer suggested retail price. If multiple prices are specified for an offer the {@link https://schema.org/priceType priceType} property can be used to identify the type of each such specified price. The value of priceType can be specified as a value from enumeration PriceTypeEnumeration or as a free form text string for price types that are not already predefined in PriceTypeEnumeration. */
  priceType: PriceTypeEnumeration;
  /** Specifies for how long this price (or price component) will be billed. Can be used, for example, to model the contractual duration of a subscription or payment plan. Type can be either a Duration or a Number (in which case the unit of measurement, for example month, is specified by the unitCode property). */
  billingDuration?: number;
  /** This property specifies the minimal quantity and rounding increment that will be the basis for the billing. The unit of measurement is specified by the unitCode property. */
  billingIncrement?: number;
}
export interface TeasersParameters {
  name: string;
  value: string;
}
export interface TeasersConditions {
  minimumQuantity: number;
  parameters: TeasersParameters[];
}
export interface TeasersEffect {
  parameters: TeasersParameters[];
}
export interface Teasers {
  name: string;
  generalValues?: unknown;
  conditions: TeasersConditions;
  effects: TeasersEffect;
}
export interface MonetaryAmount extends Omit<Thing, "@type"> {
  /**
   * The currency in which the monetary amount is expressed.
   *
   * Use standard formats: ISO 4217 currency format, e.g. "USD"; Ticker symbol for cryptocurrencies, e.g. "BTC"; well known names for Local Exchange Trading Systems (LETS) and other currency types, e.g. "Ithaca HOUR".
   */
  currency: string;
  /**
   * The upper value of some characteristic or property.
   */
  maxValue: number;
  /** The lower value of some characteristic or property. */
  minValue: number;
  /** The date when the item becomes valid. */
  validFrom: string;
  /** The date after when the item is not valid. For example the end of an offer, salary period, or a period of opening hours. */
  validThrough: string;
  /** The value of a QuantitativeValue (including Observation) or property value node. */
  value: boolean | number | string;
}
export interface MerchantReturnPolicy extends Omit<Thing, "@type"> {
  "@type": "MerchantReturnPolicy";
  /** Specifies either a fixed return date or the number of days (from the delivery date) that a product can be returned. Used when the returnPolicyCategory property is specified as MerchantReturnFiniteReturnWindow. Supersedes productReturnDays */
  merchantReturnDays?: number;
  /** A country where a particular merchant return policy applies to, for example the two-letter ISO 3166-1 alpha-2 country code. */
  applicableCountry: string;
  /** The type of return fees for purchased products (for any return reason). */
  returnFees?: ReturnFeesEnumeration;
  /** The type of return method offered, specified from an enumeration. */
  returnMethod?: ReturnMethodEnumeration;
  /** Specifies an applicable return policy (from an enumeration). */
  returnPolicyCategory: MerchantReturnEnumeration;
  /** Amount of shipping costs for product returns (for any reason). Applicable when property returnFees equals ReturnShippingFees. */
  returnShippingFeesAmount?: MonetaryAmount;
}
export interface Offer extends Omit<Thing, "@type"> {
  "@type": "Offer";
  /** The availability of this item—for example In stock, Out of stock, Pre-order, etc. */
  availability: ItemAvailability;
  /** A Global Trade Item Number ({@link https://www.gs1.org/standards/id-keys/gtin GTIN}). GTINs identify trade items, including products and services, using numeric identification codes. The {@link https://schema.org/gtin gtin} property generalizes the earlier {@link https://schema.org/gtin8 gtin8}, {@link https://schema.org/gtin12 gtin12}, {@link https://schema.org/gtin13 gtin13}, and {@link https://schema.org/gtin14 gtin14} properties. The GS1 {@link https://www.gs1.org/standards/Digital-Link/ digital link specifications} express GTINs as URLs. A correct {@link https://schema.org/gtin gtin} value should be a valid GTIN, which means that it should be an all-numeric string of either 8, 12, 13 or 14 digits, or a "GS1 Digital Link" URL based on such a string. The numeric component should also have a {@link https://www.gs1.org/services/check-digit-calculator valid GS1 check digit} and meet the other rules for valid GTINs. See also {@link http://www.gs1.org/barcodes/technical/idkeys/gtin GS1's GTIN Summary} and {@link https://en.wikipedia.org/wiki/Global_Trade_Item_Number Wikipedia} for more details. Left-padding of the gtin values is not required or encouraged. */
  gtin?: string;
  /** The current approximate inventory level for the item or items. */
  inventoryLevel: QuantitativeValue;
  /** A predefined value from OfferItemCondition specifying the condition of the product or service, or the products or services included in the offer. Also used for product return policies to specify the condition of products accepted for returns. */
  itemCondition?: OfferItemCondition;
  /**
   * The offer price of a product, or of a price component when attached to PriceSpecification and its subtypes.
   *
   * Usage guidelines:
   * - Use the {@link https://schema.org/priceCurrency priceCurrency} property (with standard formats: {@link http://en.wikipedia.org/wiki/ISO_4217 ISO 4217 currency format} e.g. "USD"; {@link https://en.wikipedia.org/wiki/List_of_cryptocurrencies Ticker symbol} for cryptocurrencies e.g. "BTC"; well known names for {@link https://en.wikipedia.org/wiki/Local_exchange_trading_system Local Exchange Tradings Systems} (LETS) and other currency types e.g. "Ithaca HOUR") instead of including {@link http://en.wikipedia.org/wiki/Dollar_sign#Currencies_that_use_the_dollar_or_peso_sign ambiguous symbols} such as '$' in the value.
   * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   * - Note that both {@link http://www.w3.org/TR/xhtml-rdfa-primer/#using-the-content-attribute RDFa} and Microdata syntax allow the use of a "content=" attribute for publishing simple machine-readable values alongside more human-friendly formatting.
   * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
   */
  price: number;
  /**
   * The currency of the price, or a price component when attached to {@link https://schema.org/PriceSpecification PriceSpecification} and its subtypes.
   *
   * Use standard formats: {@link http://en.wikipedia.org/wiki/ISO_4217 ISO 4217 currency format} e.g. "USD"; {@link https://en.wikipedia.org/wiki/List_of_cryptocurrencies Ticker symbol} for cryptocurrencies e.g. "BTC"; well known names for {@link https://en.wikipedia.org/wiki/Local_exchange_trading_system Local Exchange Tradings Systems} (LETS) and other currency types e.g. "Ithaca HOUR".
   */
  priceCurrency?: string;
  /** One or more detailed price specifications, indicating the unit price and delivery or payment charges. */
  priceSpecification: UnitPriceSpecification[];
  /** The date after which the price is no longer available. */
  priceValidUntil?: string;
  /** An entity which offers (sells / leases / lends / loans) the services / goods. A seller may also be a provider. */
  seller?: string;
  /** Name of the seller */
  sellerName?: string;
  /** The Stock Keeping Unit (SKU), i.e. a merchant-specific identifier for a product or service, or the product to which the offer refers. */
  sku?: string;
  /** Used by some ecommerce sites to retrieve the sku of products that are part of the BuyAndWin promotion */
  giftSkuIds?: string[];
  /** Used by some ecommerce providers (e.g: VTEX) to describe special promotions that depend on some conditions */
  teasers?: Teasers[];
  /** Specifies a MerchantReturnPolicy that may be applicable.  */
  hasMerchantReturnPolicy?: MerchantReturnPolicy;
}
export interface AggregateOffer {
  "@type": "AggregateOffer";
  /**
   * The highest price of all offers available.
   *
   * Usage guidelines:
   * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
   * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   */
  highPrice: number;
  /**
   * The lowest price of all offers available.
   *
   * Usage guidelines:
   * - Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similiar Unicode symbols.
   * - Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   */
  lowPrice: number;
  /** The number of offers for the product. */
  offerCount: number;
  /** An offer to provide this item—for example, an offer to sell a product, rent the DVD of a movie, perform a service, or give away tickets to an event. Use {@link https://schema.org/businessFunction businessFunction} to indicate the kind of transaction offered, i.e. sell, lease, etc. This property can also be used to describe a {@link https://schema.org/Demand Demand}. While this property is listed as expected on a number of common types, it can be used in others. In that case, using a second type, such as Product or a subtype of Product, can clarify the nature of the offer. */
  offers: Offer[];
  /**
   * The currency of the price, or a price component when attached to {@link https://schema.org/PriceSpecification PriceSpecification} and its subtypes.
   *
   * Use standard formats: {@link http://en.wikipedia.org/wiki/ISO_4217 ISO 4217 currency format} e.g. "USD"; {@link https://en.wikipedia.org/wiki/List_of_cryptocurrencies Ticker symbol} for cryptocurrencies e.g. "BTC"; well known names for {@link https://en.wikipedia.org/wiki/Local_exchange_trading_system Local Exchange Tradings Systems} (LETS) and other currency types e.g. "Ithaca HOUR".
   */
  priceCurrency?: string;
  /** Specifies a MerchantReturnPolicy that may be applicable.  */
  hasMerchantReturnPolicy?: MerchantReturnPolicy;
}
export interface ReviewPageResults {
  currentPageNumber?: number;
  nextPageUrl?: string;
  pageSize?: number;
  pagesTotal?: number;
  totalResults?: number;
}
export interface ReviewPage {
  page: ReviewPageResults;
  id: string;
  review?: Review[];
  aggregateRating?: AggregateRating;
}
export interface Review extends Omit<Thing, "@type"> {
  "@type": "Review";
  id?: string;
  /** Author of the */
  author?: Author[];
  /** The date that the review was published, in ISO 8601 date format.*/
  datePublished?: string;
  /** The item that is being reviewed/rated. */
  itemReviewed?: string;
  /** Indicates, in the context of a {@link https://schema.org/Review Review} (e.g. framed as 'pro' vs 'con' considerations), negative considerations - either as unstructured text, or a list. */
  negativeNotes?: string[];
  /** Indicates, in the context of a {@link https://schema.org/Review Review} (e.g. framed as 'pro' vs 'con' considerations), positive considerations - either as unstructured text, or a list. */
  positiveNotes?: string[];
  /** This Review or Rating is relevant to this part or facet of the itemReviewed. */
  reviewAspect?: string;
  /** Emphasis part of the review */
  reviewHeadline?: string;
  /** The actual body of the review. */
  reviewBody?: string;
  /** The rating given in this review. Note that reviews can themselves be rated. The `reviewRating` applies to rating given by the review. The {@link https://schema.org/aggregateRating aggregateRating} property applies to the review itself, as a creative work. */
  reviewRating?: AggregateRating;
  /** Extra review informations */
  tags?: ReviewTag[];
  /** BrandReviewed */
  brand?: ReviewBrand;
  /** Medias */
  media?: ReviewMedia[];
}
export interface ReviewMedia {
  type: "image" | "video";
  url?: string;
  alt?: string;
  likes?: number;
  unlikes?: number;
}
export interface ReviewBrand {
  /** Brand Name */
  name: string;
  /** Brand Logo */
  logo: string;
  /** Brand website url */
  url: string;
}
export interface ReviewTag {
  /** Label of specific topic */
  label?: string;
  /** Caracteristics about the topic */
  value?: string[];
}
/** https://schema.org/Person */
export interface Person extends Omit<Thing, "@type"> {
  /** Email address. */
  email?: string;
  /** Given name. In the U.S., the first name of a Person. */
  givenName?: string;
  /** Family name. In the U.S., the last name of a Person. */
  familyName?: string;
  /** Gender of something, typically a Person, but possibly also fictional characters, animals, etc */
  gender?: "https://schema.org/Male" | "https://schema.org/Female";
  /** An image of the item. This can be a URL or a fully described ImageObject. **/
  image?: ImageObject[] | null;
  /** The Tax / Fiscal ID of the organization or person, e.g. the TIN in the US or the CIF/NIF in Spain. */
  taxID?: string;
}
// NON SCHEMA.ORG Compliant. Should be removed ASAP
export interface Author extends Omit<Thing, "@type"> {
  "@type": "Author";
  /** The name of the author. */
  name?: string;
  /** A link to a web page that uniquely identifies the author of the article. For example, the author's social media page, an about me page, or a bio page. */
  url?: string;
  /** Indicates that the author is a real buyer */
  verifiedBuyer?: boolean;
  /** Author location */
  location?: string;
}
// TODO: fix this hack and use Product directly where it appears
// Hack to prevent type self referencing and we end up with an infinite loop
export interface ProductLeaf extends Omit<Product, "isVariantOf"> {
}
export interface ProductGroup extends Omit<Thing, "@type"> {
  "@type": "ProductGroup";
  /** Indicates a {@link https://schema.org/Product Product} that is a member of this {@link https://schema.org/ProductGroup ProductGroup} (or {@link https://schema.org/ProductModel ProductModel}). */
  hasVariant: ProductLeaf[];
  /** Indicates a textual identifier for a ProductGroup. */
  productGroupID: string;
  /**
   * A property-value pair representing an additional characteristics of the entitity, e.g. a product feature or another characteristic for which there is no matching property in schema.org.
   *
   * Note: Publishers should be aware that applications designed to use specific schema.org properties (e.g. https://schema.org/width, https://schema.org/color, https://schema.org/gtin13, ...) will typically expect such data to be provided using those properties, rather than using the generic property/value mechanism.
   */
  additionalProperty: PropertyValue[];
  /** docs https://schema.org/gtin */
  model?: string;
}
export interface Brand extends Omit<Thing, "@type"> {
  "@type": "Brand";
  /** Brand's image url */
  logo?: string;
}
export interface Answer extends Omit<Thing, "@type"> {
  text: string;
  /** The date that the anwser was published, in ISO 8601 date format.*/
  dateModified?: string;
  /** The date that the anwser was published, in ISO 8601 date format.*/
  datePublished?: string;
  /** Author of the */
  author?: Author[];
}
export interface Question extends Omit<Thing, "@type" | "name"> {
  "@type": "Question";
  answerCount: number;
  /** The answer(s) that has been accepted as best */
  acceptedAnswer?: Answer;
  /** List of answer(s) */
  suggestedAnswer?: Answer[];
  name: string;
  text: string;
  /** The date that the question was published, in ISO 8601 date format.*/
  dateModified?: string;
  /** The date that the question was published, in ISO 8601 date format.*/
  datePublished?: string;
  /** Author of the */
  author?: Author[];
}
export interface Product extends Omit<Thing, "@type"> {
  "@type": "Product";
  /**
   * A property-value pair representing an additional characteristics of the entitity, e.g. a product feature or another characteristic for which there is no matching property in schema.org.
   *
   * Note: Publishers should be aware that applications designed to use specific schema.org properties (e.g. https://schema.org/width, https://schema.org/color, https://schema.org/gtin13, ...) will typically expect such data to be provided using those properties, rather than using the generic property/value mechanism.
   */
  additionalProperty?: PropertyValue[];
  /** The overall rating, based on a collection of reviews or ratings, of the item. */
  aggregateRating?: AggregateRating;
  /** An award won by or for this item. */
  award?: string;
  /** The brand(s) associated with a product or service, or the brand(s) maintained by an organization or business person. */
  brand?: Brand;
  /** A category for the item. Greater signs or slashes can be used to informally indicate a category hierarchy. */
  category?: string;
  /** A Global Trade Item Number ({@link https://www.gs1.org/standards/id-keys/gtin GTIN}). GTINs identify trade items, including products and services, using numeric identification codes. The {@link https://schema.org/gtin gtin} property generalizes the earlier {@link https://schema.org/gtin8 gtin8}, {@link https://schema.org/gtin12 gtin12}, {@link https://schema.org/gtin13 gtin13}, and {@link https://schema.org/gtin14 gtin14} properties. The GS1 {@link https://www.gs1.org/standards/Digital-Link/ digital link specifications} express GTINs as URLs. A correct {@link https://schema.org/gtin gtin} value should be a valid GTIN, which means that it should be an all-numeric string of either 8, 12, 13 or 14 digits, or a "GS1 Digital Link" URL based on such a string. The numeric component should also have a {@link https://www.gs1.org/services/check-digit-calculator valid GS1 check digit} and meet the other rules for valid GTINs. See also {@link http://www.gs1.org/barcodes/technical/idkeys/gtin GS1's GTIN Summary} and {@link https://en.wikipedia.org/wiki/Global_Trade_Item_Number Wikipedia} for more details. Left-padding of the gtin values is not required or encouraged. */
  gtin?: string;
  /** Indicates the {@link https://schema.org/productGroupID productGroupID} for a {@link https://schema.org/ProductGroup ProductGroup} that this product {@link https://schema.org/isVariantOf isVariantOf}. */
  inProductGroupWithID?: string;
  // TODO: Make json schema generator support self-referencing types
  // /** A pointer to another, somehow related product (or multiple products). */
  isRelatedTo?: Product[] | null;
  /** A pointer to another, functionally similar product (or multiple products). */
  isSimilarTo?: Product[] | null;
  /** Indicates the kind of product that this is a variant of. In the case of {@link https://schema.org/ProductModel ProductModel}, this is a pointer (from a ProductModel) to a base product from which this product is a variant. It is safe to infer that the variant inherits all product features from the base model, unless defined locally. This is not transitive. In the case of a {@link https://schema.org/ProductGroup ProductGroup}, the group description also serves as a template, representing a set of Products that vary on explicitly defined, specific dimensions only (so it defines both a set of variants, as well as which values distinguish amongst those variants). When used with {@link https://schema.org/ProductGroup ProductGroup}, this property can apply to any {@link https://schema.org/Product Product} included in the group. */
  isVariantOf?: ProductGroup;
  /** An offer to provide this item—for example, an offer to sell a product, rent the DVD of a movie, perform a service, or give away tickets to an event. Use {@link https://schema.org/businessFunction businessFunction} to indicate the kind of transaction offered, i.e. sell, lease, etc. This property can also be used to describe a {@link https://schema.org/Demand Demand}. While this property is listed as expected on a number of common types, it can be used in others. In that case, using a second type, such as Product or a subtype of Product, can clarify the nature of the offer. */
  offers?: AggregateOffer;
  /** The product identifier, such as ISBN. For example: `meta itemprop="productID" content="isbn:123-456-789"`. */
  productID: string;
  /** The date of production of the item, e.g. vehicle. */
  productionDate?: string;
  /** The release date of a product or product model. This can be used to distinguish the exact variant of a product. */
  releaseDate?: string;
  /** A review of the item. */
  review?: Review[];
  /** The Stock Keeping Unit (SKU), i.e. a merchant-specific identifier for a product or service, or the product to which the offer refers. */
  sku: string;
  /** A pointer to another product (or multiple products) for which this product is an accessory or spare part. */
  isAccessoryOrSparePartFor?: Product[] | null;
  questions?: Question[];
}
export interface ListItem<T = string> extends Omit<Thing, "@type"> {
  "@type": "ListItem";
  /** An entity represented by an entry in a list or data feed (e.g. an 'artist' in a list of 'artists')’. */
  item: T;
  /** The position of an item in a series or sequence of items. */
  position: number;
}
export interface ItemList<T = string> extends Omit<Thing, "@type"> {
  "@type": "ItemList";
  /**
   * For itemListElement values, you can use simple strings (e.g. "Peter", "Paul", "Mary"), existing entities, or use ListItem.
   *
   * Text values are best if the elements in the list are plain strings. Existing entities are best for a simple, unordered list of existing things in your data. ListItem is used with ordered lists when you want to provide additional context about the element in that list or when the same item might be in different places in different lists.
   *
   * Note: The order of elements in your mark-up is not sufficient for indicating the order or elements. Use ListItem with a 'position' property in such cases.
   */
  itemListElement: ListItem<T>[];
  /** The number of items in an ItemList. Note that some descriptions might not fully describe all items in a list (e.g., multi-page pagination); in such cases, the numberOfItems would be for the entire list. */
  numberOfItems: number;
}
export interface BreadcrumbList extends Omit<ItemList, "@type"> {
  "@type": "BreadcrumbList";
}
export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday"
  | "PublicHolidays";
export interface OpeningHoursSpecification extends Omit<Thing, "@type"> {
  "@type": "OpeningHoursSpecification";
  /** The closing hour of the place or service on the given day(s) of the week. */
  closes?: string;
  /** The day of the week for which these opening hours are valid. */
  dayOfWeek?: DayOfWeek;
  /** The opening hour of the place or service on the given day(s) of the week. */
  opens?: string;
  /** The date when the item becomes valid. */
  validFrom?: string;
  /** The date after when the item is not valid. For example the end of an offer, salary period, or a period of opening hours. */
  validThrough?: string;
}
export interface ContactPoint extends Omit<Thing, "@type"> {
  "@type": "ContactPoint";
  /** The geographic area where a service or offered item is provided. */
  areaServed?: string;
  /** The language of the content or performance or used in an action. Please use one of the language codes from the IETF BCP 47 standard. See also availableLanguage. */
  availableLanguage?: string;
  /** An option available on this contact point (e.g. a toll-free number or support for hearing-impaired callers). */
  contactOption?: "TollFree" | "HearingImpairedSupported";
  /** A person or organization can have different contact points, for different purposes. For example, a sales contact point, a PR contact point and so on. This property is used to specify the kind of contact point. */
  contactType?: string;
  /** Email address. */
  email?: string;
  /** The fax number. */
  faxNumber?: string;
  /** The hours during which this service or contact is available. */
  hoursAvailable?: OpeningHoursSpecification;
  /** The product or service this support contact point is related to (such as product support for a particular product line). This can be a specific product or product line (e.g. "iPhone") or a general category of products or services (e.g. "smartphones"). */
  productSupported?: string;
  /** The telephone number. */
  telephone?: string;
}
export interface PostalAddress extends Omit<ContactPoint, "@type"> {
  "@type": "PostalAddress";
  /** The country. For example, USA. You can also provide the two-letter ISO 3166-1 alpha-2 country code. */
  addressCountry?: string;
  /** The locality in which the street address is, and which is in the region. For example, Mountain View. */
  addressLocality?: string;
  /** The region in which the locality is, and which is in the country. For example, California. */
  addressRegion?: string;
  /** The postal code. For example, 94043. */
  postalCode?: string;
  /** The street address. For example, 1600 Amphitheatre Pkwy. */
  streetAddress?: string;
}
export interface LocationFeatureSpecification
  extends Omit<PropertyValue, "@type"> {
  "@type": "LocationFeatureSpecification";
  /** The hours during which this service or contact is available. */
  hoursAvailable?: OpeningHoursSpecification;
  /** The date when the item becomes valid. */
  validFrom?: string;
  /** The date after when the item is not valid. For example the end of an offer, salary period, or a period of opening hours. */
  validThrough?: string;
}
export interface GeoCoordinates extends Omit<Thing, "@type"> {
  "@type": "GeoCoordinates";
  /** The geographic area where a service or offered item is provided. */
  address?: PostalAddress;
  /** The country. For example, USA. You can also provide the two-letter ISO 3166-1 alpha-2 country code. */
  addressCountry?: string;
  /** The elevation of a location (WGS 84). Values may be of the form 'NUMBER UNIT_OF_MEASUREMENT' (e.g., '1,000 m', '3,200 ft') while numbers alone should be assumed to be a value in meters. */
  elevation?: number;
  /** The latitude of a location. For example 37.42242 (WGS 84). */
  latitude?: number;
  /** The longitude of a location. For example -122.08585 (WGS 84). */
  longitude?: number;
  /** The postal code. For example, 94043. */
  postalCode?: string;
}
export interface GeoShape extends Omit<Thing, "@type"> {
  "@type": "GeoShape";
  /** The GeoShape for the GeoCoordinates or GeoCircle. */
  box?: string;
  /** The GeoShape for the GeoCoordinates or GeoCircle. */
  circle?: string;
  /** The elevation of a location (WGS 84). Values may be of the form 'NUMBER UNIT_OF_MEASUREMENT' (e.g., '1,000 m', '3,200 ft') while numbers alone should be assumed to be a value in meters. */
  elevation?: number;
  /** A line is a point-to-point path consisting of two or more points. A line is expressed as a series of two or more point objects separated by space. */
  line?: string;
  /** The GeoShape for the GeoCoordinates or GeoCircle. */
  polygon?: string;
  /** The postal code. For example, 94043. */
  postalCode?: string;
}
export interface About extends Omit<Thing, "@type"> {
  "@type": "About";
}
export interface Rating extends Omit<Thing, "@type"> {
  "@type": "Rating";
  /** The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably. */
  author?: Person;
  /** The highest value allowed in this rating system. */
  bestRating?: number;
  /** 	A short explanation (e.g. one to two sentences) providing background context and other information that led to the conclusion expressed in the rating. This is particularly applicable to ratings associated with "fact check" markup using ClaimReview. */
  ratingExplanation?: string;
  /**
   * The rating for the content.
   * Usage guidelines:
   *
   * Use values from 0123456789 (Unicode 'DIGIT ZERO' (U+0030) to 'DIGIT NINE' (U+0039)) rather than superficially similar Unicode symbols.
   *
   * Use '.' (Unicode 'FULL STOP' (U+002E)) rather than ',' to indicate a decimal point. Avoid using these symbols as a readability separator.
   */
  ratingValue?: number;
  /** This Review or Rating is relevant to this part or facet of the itemReviewed. */
  reviewAspect?: string;
  /** The lowest value allowed in this rating system. */
  worstRating?: number;
}
export interface Organization extends Omit<Thing, "@type"> {
  "@type": "Organization";
}
export interface AdministrativeArea extends Omit<Thing, "@type"> {
  "@type": "AdministrativeArea";
}
export type CertificationStatus =
  | "CertificationActive"
  | "CertificationInactive";
export interface Certification extends Omit<CreativeWork, "@type"> {
  "@type": "Certification";
  /** The subject matter of the content. */
  about?: About;
  /** Date when a certification was last audited. */
  auditData?: string;
  /** Identifier of a certification instance (as registered with an independent certification body). Typically this identifier can be used to consult and verify the certification instance. */
  certificationIdentification?: string;
  /** 	Rating of a certification instance (as defined by an independent certification body). Typically this rating can be used to rate the level to which the requirements of the certification instance are fulfilled. */
  certificationRating?: Rating;
  /** Indicates the current status of a certification: active or inactive. */
  certificationStatus?: CertificationStatus;
  /** Date of first publication or broadcast. For example the date a CreativeWork was broadcast or a Certification was issued. */
  datePublished?: string;
  /** Date the content expires and is no longer useful or available. For example a VideoObject or NewsArticle whose availability or relevance is time-limited, a ClaimReview fact check whose publisher wants to indicate that it may no longer be relevant (or helpful to highlight) after some date, or a Certification the validity has expired. */
  expires?: string;
  /** A measurement of an item, For example, the inseam of pants, the wheel size of a bicycle, the gauge of a screw, or the carbon footprint measured for certification by an authority. Usually an exact measurement, but can also be a range of measurements for adjustable products, for example belts and ski bindings. */
  hasMeasurement?: QuantitativeValue;
  /** The organization issuing the item, for example a Permit, Ticket, or Certification. */
  issuedBy?: Organization;
  /** An associated logo. */
  logo?: ImageObject;
  /** The date when the item becomes valid. */
  validFrom?: string;
  /** The geographic area where the item is valid. Applies for example to a Permit, a Certification, or an EducationalOccupationalCredential. */
  validIn?: AdministrativeArea;
}
export interface PlaceLeaf extends Omit<Thing, "@type"> {
  "@type": "Place";
  /** A property-value pair representing an additional characteristics of the entitity, e.g. a product feature or another characteristic for which there is no matching property in schema.org. */
  additionalProperty?: PropertyValue[];
  /** Physical address of the item. */
  address?: PostalAddress;
  /** The overall rating, based on a collection of reviews or ratings, of the item. */
  aggregateRating?: AggregateRating;
  /** An amenity feature (e.g. a characteristic or service) of the Accommodation. This generic property does not make a statement about whether the feature is included in an offer for the main accommodation or available at extra costs. */
  amenityFeature?: LocationFeatureSpecification;
  /** A short textual code (also called "store code") that uniquely identifies a place of business. The code is typically assigned by the parentOrganization and used in structured URLs. */
  branchCode?: string;
  /** Upcoming or past event associated with this place, organization, or action. */
  faxNumber?: string;
  /** The geo coordinates of the place. */
  geo?: GeoCoordinates | GeoShape;
  /** The Global Location Number (GLN, sometimes also referred to as International Location Number or ILN) of the respective organization, person, or place. The GLN is a 13-digit number used to identify parties and physical locations. */
  globalLocationNumber?: string;
  /** Certification information about a product, organization, service, place or person. */
  hasCertification?: Certification;
  /** Indicates whether some facility offers the service that can be used by driving through in a car */
  hasDriveThroughService?: boolean;
  /** The GS1 digital link associated with the object. This URL should conform to the particular requirements of digital links. The link should only contain the Application Identifiers (AIs) that are relevant for the entity being annotated, for instance a Product or an Organization, and for the correct granularity. */
  hasDigitalLink?: string;
  /** A URL to a map of the place. Supersedes maps, map. */
  hasMap?: string;
  /** A flag to signal that the item, event, or place is accessible for free. Supersedes free. */
  isAccessibleForFree?: boolean;
  /** The International Standard of Industrial Classification of All Economic Activities (ISIC), Revision 4 code for a particular organization, business person, or place. */
  isicV4?: string;
  /** Keywords or tags used to describe some item. Multiple textual entries in a keywords list are typically delimited by commas, or by repeating the property. */
  keywords?: string;
  /** The latitude of a location. For example 37.42242 (WGS 84). */
  latitude?: number;
  /** An associated logo. */
  logo?: ImageObject;
  /** The longitude of a location. For example -122.08585 (WGS 84). */
  longitude?: number;
  /** The total number of individuals that may attend an event or venue. */
  maximumAttendeeCapacity?: number;
  /** The opening hours of a certain place. */
  openingHoursSpecification?: OpeningHoursSpecification[];
  /** A photograph of this place. */
  photo?: ImageObject;
  /** A flag to signal that the Place is open to public visitors. If this property is omitted there is no assumed default boolean value. */
  publicAccess?: boolean;
  /** A review of the item. */
  review?: Review;
  /** A slogan or motto associated with the item. */
  slogan?: string;
  /** Indicates whether it is allowed to smoke in the place, e.g. in the restaurant, hotel or hotel room. */
  smokingAllowed?: boolean;
  /** The special opening hours of a certain place. */
  specialOpeningHoursSpecification?: OpeningHoursSpecification[];
  /** The telephone number. */
  telephone?: string;
  /** A page providing information on how to book a tour of some Place, such as an Accommodation or ApartmentComplex in a real estate setting, as well as other kinds of tours as appropriate. */
  tourBookingPage?: string;
}
/** Entities that have a somewhat fixed, physical extension. */
export interface Place extends PlaceLeaf {
  /** The basic containment relation between a place and one that contains it. Supersedes containedIn. Inverse property: containsPlace. */
  containedIn?: PlaceLeaf;
  /** The basic containment relation between a place and another that it contains. Inverse property: containedInPlace. */
  containedInPlace?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a containing geometry to a contained geometry. "a contains b iff no points of b lie in the exterior of a, and at least one point of the interior of b lies in the interior of a". As defined in DE-9IM. */
  geoContains?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that covers it. As defined in DE-9IM. */
  geoCoveredBy?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that crosses it: for example, the union of two geometries. As defined in DE-9IM. */
  geoCrosses?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that disjoints it: for example, a spit or cut in two geometries. As defined in DE-9IM. */
  geoDisjoint?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that equals it: for example, a point marked by a sign or a symbol. As defined in DE-9IM. */
  geoEquals?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that has as part(s) that overlap the subject geometry. As defined in DE-9IM. */
  geoIntersects?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that is within it: for example, the region of spread out of a given geographical area. As defined in DE-9IM. */
  geoOverlaps?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that covers it. As defined in DE-9IM. */
  geoTouches?: PlaceLeaf;
  /** Represents a relationship between two geometries (or the places they represent), relating a geometry to another that lies on it. As defined in DE-9IM. */
  geoWithin?: PlaceLeaf;
}
export interface FilterToggleValue {
  quantity: number;
  label: string;
  value: string;
  selected: boolean;
  url: string;
  children?: Filter | null;
}
export interface FilterRangeValue {
  min: number;
  max: number;
}
export interface FilterBase {
  label: string;
  key: string;
}
export interface FilterToggle extends FilterBase {
  "@type": "FilterToggle";
  values: FilterToggleValue[];
  quantity: number;
}
export interface FilterRange extends FilterBase {
  "@type": "FilterRange";
  values: FilterRangeValue;
}
export type Filter = FilterToggle | FilterRange;
export type SortOption = {
  value: string;
  label: string;
};
export interface ProductDetailsPage {
  "@type": "ProductDetailsPage";
  breadcrumbList: BreadcrumbList;
  product: Product;
  seo?: Seo | null;
}
export type PageType =
  | "Brand"
  | "Category"
  | "Department"
  | "SubCategory"
  | "Product"
  | "Collection"
  | "Cluster"
  | "Search"
  | "Unknown";
export interface PageInfo {
  currentPage: number;
  nextPage: string | undefined;
  previousPage: string | undefined;
  records?: number | undefined;
  recordPerPage?: number | undefined;
  pageTypes?: PageType[];
}
export interface ProductListingPage {
  "@type": "ProductListingPage";
  breadcrumb: BreadcrumbList;
  filters: Filter[];
  products: Product[];
  pageInfo: PageInfo;
  sortOptions: SortOption[];
  seo?: Seo | null;
}
export interface Seo {
  title: string;
  description: string;
  canonical: string;
  noIndexing?: boolean;
}
export interface Search {
  term: string;
  href?: string;
  hits?: number;
  facets?: Array<{
    key: string;
    values: string[];
  }>;
}
export interface Suggestion {
  searches?: Search[];
  products?: Product[] | null;
  hits?: number;
}
/** @titleBy url */
export interface SiteNavigationElementLeaf {
  /**
   * @ignore
   */
  "@type": "SiteNavigationElement";
  /** An additional type for the item, typically used for adding more specific types from external vocabularies in microdata syntax. This is a relationship between something and a class that the thing is in. In RDFa syntax, it is better to use the native RDFa syntax - the 'typeof' attribute - for multiple types. Schema.org tools may have only weaker understanding of extra types, in particular those defined externally. */
  additionalType?: string;
  /** The identifier property represents any kind of identifier for any kind of {@link https://schema.org/Thing Thing}, such as ISBNs, GTIN codes, UUIDs etc. Schema.org provides dedicated properties for representing many of these, either as textual strings or as URL (URI) links. See {@link /docs/datamodel.html#identifierBg background notes} for more details. */
  identifier?: string;
  /** An image of the item. This can be a {@link https://schema.org/URL URL} or a fully described {@link https://schema.org/ImageObject ImageObject}. */
  image?: ImageObject[] | null;
  /** The name of the item. */
  name?: string;
  /** URL of the item. */
  url?: string;
}
export interface SiteNavigationElement extends SiteNavigationElementLeaf {
  // TODO: The schema generator is not handling recursive types leading to an infinite loop
  // Lets circunvent this issue by enumerating the max allowed depth
  children?: Array<
    SiteNavigationElementLeaf & {
      children?: Array<
        SiteNavigationElementLeaf & {
          children?: Array<
            SiteNavigationElementLeaf & {
              children?: Array<
                SiteNavigationElementLeaf & {
                  children?: SiteNavigationElementLeaf[];
                }
              >;
            }
          >;
        }
      >;
    }
  >;
}
/** @deprecated Use SiteNavigationElement instead */
export interface NavItem {
  label: string;
  href: string;
  image?: {
    src?: string;
    alt?: string;
  };
}
/** @deprecated Use SiteNavigationElement instead */
export interface Navbar extends NavItem {
  // TODO: The schema generator is not handling recursive types leading in a infinite recursion loop
  // deno-lint-ignore no-explicit-any
  children?: any[];
}
// deno-lint-ignore no-explicit-any
export interface IEvent<Params = any> {
  name: string;
  params: Params;
}
// 3 letter ISO 4217 - Doc: https://en.wikipedia.org/wiki/ISO_4217#Active_codes
type Currency = string;
type Value = number;
interface WithItemId {
  item_id: string;
}
interface WithItemName {
  item_name: string;
}
type ItemIdentifier = WithItemId | WithItemName;
interface AnalyticsItemWithoutIdentifier {
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_group_id?: string;
  item_url?: string;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: Value;
  quantity: number;
}
export type AnalyticsItem = AnalyticsItemWithoutIdentifier & ItemIdentifier;
export interface AddShippingInfoParams {
  currency?: Currency;
  value?: Value;
  coupon?: string;
  shipping_tier?: string;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_shipping_info */
export interface AddShippingInfoEvent extends IEvent<AddShippingInfoParams> {
  name: "add_shipping_info";
}
export interface AddToCartParams {
  currency?: Currency;
  value?: Value;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_cart */
export interface AddToCartEvent extends IEvent<AddToCartParams> {
  name: "add_to_cart";
}
export interface AddToWishlistParams {
  currency?: Currency;
  value?: Value;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_wishlist */
export interface AddToWishlistEvent extends IEvent<AddToWishlistParams> {
  name: "add_to_wishlist";
}
export interface BeginCheckoutParams {
  currency: Currency;
  value: Value;
  items: AnalyticsItem[];
  coupon?: string;
}
/** docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#begin_checkout */
export interface BeginCheckoutEvent extends IEvent<BeginCheckoutParams> {
  name: "begin_checkout";
}
export interface LoginParams {
  method?: string;
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#login */
export interface LoginEvent extends IEvent<LoginParams> {
  name: "login";
}
export interface RemoveFromCartParams {
  currency?: Currency;
  value?: Value;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#remove_from_cart */
export interface RemoveFromCartEvent extends IEvent<RemoveFromCartParams> {
  name: "remove_from_cart";
}
export interface SearchParams {
  search_term: string;
}
export interface SearchEvent extends IEvent<SearchParams> {
  name: "search";
}
export interface SelectItemParams {
  item_list_id?: string;
  item_list_name?: string;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#select_item */
export interface SelectItemEvent extends IEvent<SelectItemParams> {
  name: "select_item";
}
export interface SelectPromotionParams {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
  items?: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#select_promotion */
export interface SelectPromotionEvent extends IEvent<SelectPromotionParams> {
  name: "select_promotion";
}
export interface ViewCartParams {
  currency: Currency;
  value: Value;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_cart */
export interface ViewCartEvent extends IEvent<ViewCartParams> {
  name: "view_cart";
}
export interface ViewItemParams {
  currency?: Currency;
  value?: Value;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#view_item */
export interface ViewItemEvent extends IEvent<ViewItemParams> {
  name: "view_item";
}
export interface ViewItemListParams {
  item_list_id?: string;
  item_list_name?: string;
  items: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item_list */
export interface ViewItemListEvent extends IEvent<ViewItemListParams> {
  name: "view_item_list";
}
export interface ViewPromotionParams {
  creative_name?: string;
  creative_slot?: string;
  promotion_id?: string;
  promotion_name?: string;
  items?: AnalyticsItem[];
}
/** @docs https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_promotion */
export interface ViewPromotionEvent extends IEvent<ViewPromotionParams> {
  name: "view_promotion";
}
export interface Page {
  id: string | number;
  pathTemplate?: string;
}
export interface Deco {
  flags: Flag[];
  page: Page;
}
export interface DecoEvent extends IEvent<Deco> {
  name: "deco";
}
export type AnalyticsEvent =
  | AddShippingInfoEvent
  | AddToCartEvent
  | AddToWishlistEvent
  | BeginCheckoutEvent
  | LoginEvent
  | RemoveFromCartEvent
  | SearchEvent
  | SelectItemEvent
  | SelectPromotionEvent
  | ViewCartEvent
  | ViewItemEvent
  | ViewItemListEvent
  | ViewPromotionEvent
  | DecoEvent;
