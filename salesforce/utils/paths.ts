import { Account } from "./types.ts";
import { stringfyParams } from "./utils.ts";
import { PDPParams, ProductSearchParams } from "./types.ts";
export const paths = ({
  shortCode,
  siteId,
  organizationId,
  currency,
  locale,
}: Account) => {
  const base = `https://${shortCode}.api.commercecloud.salesforce.com`;
  const href = (path: string, extraParams?: object) => {
    if (extraParams) {
      path = path + stringfyParams(extraParams);
    }
    return new URL(path, base).href;
  };

  return {
    shopper: {
      auth: {
        v1: {
          organizations: {
            _organizationId: {
              oauth2: {
                token: href(
                  `/shopper/auth/v1/organizations/${organizationId}/oauth2/token`,
                ),
              },
            },
          },
        },
      },
    },
    s: {
      _siteId: {
        dw: {
          shop: {
            v23_2: {
              sessions: {
                grant_type: (grant_type: string) =>
                  href(
                    `/s/${siteId}/dw/shop/v23_2/sessions?grant_type=${grant_type}`,
                  ),
              },
            },
          },
        },
      },
    },
    customer: {
      shopper_customers: {
        v1: {
          organizations: {
            _organizationId: {
              customers: {
                customerId: (customerId: string) => ({
                  _: () =>
                    href(
                      `/customer/shopper-customers/v1/organizations/${organizationId}/customers/${customerId}/?siteId=${siteId}`,
                    ),
                  product_lists: () => ({
                    _: href(
                      `/customer/shopper-customers/v1/organizations/${organizationId}/customers/${customerId}/product-lists?siteId=${siteId}`,
                    ),
                    listId: (listId: string) => ({
                      items: (itemId?: string) => {
                        return itemId
                          ? href(
                            `/customer/shopper-customers/v1/organizations/${organizationId}/customers/${customerId}/product-lists/${listId}/items/${itemId}?siteId=${siteId}`,
                          )
                          : href(
                            `/customer/shopper-customers/v1/organizations/${organizationId}/customers/${customerId}/product-lists/${listId}/items?siteId=${siteId}`,
                          );
                      },
                    }),
                  }),
                }),
              },
            },
          },
        },
      },
    },
    checkout: {
      shopper_baskets: {
        v1: {
          organizations: {
            _organizationId: {
              baskets: (taxMode?: "internal" | "external") => ({
                _: taxMode
                  ? href(
                    `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets?siteId=${siteId}&locale=${locale}&taxMode=${taxMode}`,
                  )
                  : href(
                    `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets?siteId=${siteId}&locale=${locale}`,
                  ),
                basketId: (basketId: string) => ({
                  _: href(
                    `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets/${basketId}?siteId=${siteId}&locale=${locale}`,
                  ),
                  coupons: {
                    _: href(
                      `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets/${basketId}/coupons?siteId=${siteId}&locale=${locale}`,
                    ),
                    couponId: (couponId: string) =>
                      href(
                        `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets/${basketId}/coupons/${couponId}?siteId=${siteId}&locale=${locale}`,
                      ),
                  },
                  items: {
                    _: href(
                      `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets/${basketId}/items?siteId=${siteId}&locale=${locale}`,
                    ),
                    itemId: (itemId: string) =>
                      href(
                        `/checkout/shopper-baskets/v1/organizations/${organizationId}/baskets/${basketId}/items/${itemId}?siteId=${siteId}&locale=${locale}`,
                      ),
                  },
                }),
              }),
            },
          },
        },
      },
    },
    search: {
      shopper_search: {
        v1: {
          organizations: {
            _organizationId: {
              search_suggestions: {
                q: (query: string) => ({
                  limit: (limit: number) =>
                    href(
                      `/search/shopper-search/v1/organizations/${organizationId}/search-suggestions?siteId=${siteId}&q=${query}&limit=${limit}&currency=${currency}&locale=${locale}`,
                    ),
                }),
              },
              product_search: {
                q: (query?: string, extraParams?: ProductSearchParams) => {
                  return href(
                    `/search/shopper-search/v1/organizations/${organizationId}/product-search?siteId=${siteId}${
                      query ? `&q=${query}` : ""
                    }&currency=${currency}&locale=${locale}`,
                    extraParams,
                  );
                },
              },
            },
          },
        },
      },
    },
    product: {
      shopper_products: {
        v1: {
          organizations: {
            _organizationId: {
              products: {
                productId: (productId: string, extraParams?: PDPParams) => {
                  return href(
                    `/product/shopper-products/v1/organizations/${organizationId}/products/${productId}?siteId=${siteId}&currency=${currency}&locale=${locale}`,
                    extraParams,
                  );
                },
              },

              categories: {
                categoryId: (categoryId: string) => ({
                  _: href(
                    `/product/shopper-products/v1/organizations/${organizationId}/categories/${categoryId}?siteId=${siteId}&locale=${locale}`,
                  ),
                  levels: (levels: number) =>
                    href(
                      `/product/shopper-products/v1/organizations/${organizationId}/categories/${categoryId}?siteId=${siteId}&locale=${locale}&levels=${levels}`,
                    ),
                }),
              },
            },
          },
        },
      },
    },
  };
};
