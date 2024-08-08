export interface ShopifyAccount {
  /**
   * @description Shopify store name.
   */
  storeName: string;

  /**
   * @description Shopify storefront access token.
   */
  storefrontAccessToken: string;
}
export interface VNDAAccount {
  /**
   * @description Your VNDA domain name. For example, https://mystore.vnda.com.br
   */
  domain: string;

  /** @description e.g: deco.cdn.vnda.com.br */
  internalDomain: string;

  /**
   * @description The token generated from admin panel. Read here: https://developers.vnda.com.br/docs/chave-de-acesso-e-requisicoes. Do not add any other permissions than catalog.
   */
  authToken: string;

  /**
   * @description Define if sandbox environment should be used
   */
  useSandbox: boolean;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;
}
export interface VTEXAccount {
  /**
   * @description VTEX Account name. For more info, read here: https://help.vtex.com/en/tutorial/o-que-e-account-name--i0mIGLcg3QyEy8OCicEoC.
   */
  account: string;

  /**
   * @title Public store URL
   * @description Domain that is registered on License Manager (e.g: www.mystore.com.br)
   */
  publicUrl?: string;

  /**
   * @description Locale used for VTEX Intelligent Search client.
   */
  defaultLocale: string;

  /**
   * @description Default price currency.
   * @default USD
   */
  defaultPriceCurrency: string;

  /**
   * @description VTEX sales channel. This will be the default sales channel your site. For more info, read here: https://help.vtex.com/tutorial/how-trade-policies-work--6Xef8PZiFm40kg2STrMkMV
   */
  defaultSalesChannel: string;
  defaultRegionId?: string;
  defaultHideUnavailableItems?: boolean;
}
