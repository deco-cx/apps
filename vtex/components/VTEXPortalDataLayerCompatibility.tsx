import { useScriptAsDataURI } from "deco/hooks/useScript.ts";
import { type JSX } from "preact";
import { Product } from "../../commerce/types.ts";

declare global {
  interface Window {
    // deno-lint-ignore no-explicit-any
    datalayer_product: any;
    shelfProductIds: string[];
    skuJson: ProductSKUJsonProps;
    dataLayer: unknown[];
  }
}

type ScriptProps = JSX.HTMLAttributes<HTMLScriptElement>;

function addVTEXPortalDataSnippet(accountName: string) {
  performance.mark("start-vtex-dl");
  const url = new URL(globalThis.window.location.href);
  const structuredDataScripts =
    document.querySelectorAll('script[type="application/ld+json"]') || [];
  // deno-lint-ignore no-explicit-any
  const structuredDatas: Record<string, any>[] = [];
  // deno-lint-ignore no-explicit-any
  structuredDataScripts.forEach((v: any) => {
    structuredDatas.push(JSON.parse(v.text));
  });
  const breadcrumbSD = structuredDatas.find(
    (s) => s["@type"] === "BreadcrumbList",
  );
  performance.mark("end-sd");

  // deno-lint-ignore no-explicit-any
  const getPageType = (structuredData: undefined | Record<string, any>) => {
    if (url.pathname === "/") return "homeView";

    const isProductPage = structuredDatas.some((s) => s["@type"] === "Product");
    if (isProductPage) return "productView";

    const isSearchPage = url.pathname === "/s";
    if (isSearchPage) return "internalSiteSearchView";

    if (structuredData?.itemList?.length === 1) {
      return "departmentView";
    }

    if (structuredData?.itemList?.length >= 2) {
      return "categoryView";
    }

    return "otherView";
  };
  const pageType = getPageType(breadcrumbSD);

  // deno-lint-ignore no-explicit-any
  const props: Record<string, any> = {
    pageCategory: "Home",
    pageDepartment: null,
    pageUrl: globalThis.window.location.href,
    pageTitle: document.title,
    skuStockOutFromShelf: [],
    skuStockOutFromProductDetail: [],
    accountName: `${accountName}`,
    pageFacets: [],
    shelfProductIds: [],
  };

  const department = breadcrumbSD?.itemListElement?.[0];
  if (pageType === "productView") {
    props.pageCategory = "Product";
    props.pageDepartment = department?.name || null;
    const product = globalThis.window.datalayer_product || {};
    Object.assign(props, product);
  }

  if (pageType === "departmentView") {
    props.pageCategory = "Department";
    props.pageDepartment = department?.name || null;
    props.departmentName = department?.name || null;
    props.categoryName = department?.name || null;
  }

  const category = breadcrumbSD?.itemListElement?.[1];
  if (pageType === "categoryView") {
    props.pageCategory = "Category";
    props.pageDepartment = department?.name || null;
    props.categoryName = category?.name || null;
  }

  if (pageType === "internalSiteSearchView") {
    props.pageCategory = "InternalSiteSearch";
    props.siteSearchTerm = url.searchParams.get("q");
  }

  if (pageType === "otherView") {
    const pathNames = url.pathname.split("/").filter(Boolean);
    props.pageCategory = pathNames.pop() || null;
  }

  props.shelfProductIds = globalThis.window.shelfProductIds || [];

  globalThis.window.dataLayer = globalThis.window.dataLayer || [];
  // VTEX Default position is first...
  globalThis.window.dataLayer.unshift(props);
  // But GTM handles .push function
  globalThis.window.dataLayer.push(props);
  globalThis.window.dataLayer.push({ event: pageType });
  performance.mark("end-vtex-dl");
  performance.measure("vtex-dl-qs-ld-json", "start-vtex-dl", "end-sd");
  performance.measure("vtex-dl-compat", "start-vtex-dl", "end-vtex-dl");
}

interface AddVTEXPortalData extends ScriptProps {
  accountName: string;
}
export function AddVTEXPortalData({
  accountName,
  ...props
}: AddVTEXPortalData) {
  return (
    <script
      {...props}
      id="datalayer-portal-compat"
      defer
      src={useScriptAsDataURI(addVTEXPortalDataSnippet, accountName)}
    />
  );
}

interface ProductDetailsTemplateProps extends ScriptProps {
  product: Product;
}

export function ProductDetailsTemplate({
  product,
  ...props
}: ProductDetailsTemplateProps) {
  const departament = product.additionalProperty?.find(
    (p) => p.name === "category",
  );
  const category = product.additionalProperty
    ?.slice()
    .reverse()
    .find((p) => p.name === "category");

  const offers = product.offers?.offers;
  const lowestOffer = offers?.[0]?.priceSpecification;
  const highestOffer = offers?.[offers.length - 1]?.priceSpecification;
  const template = {
    productId: product.isVariantOf?.productGroupID,
    productReferenceId: product.isVariantOf?.model,
    productEans: product.isVariantOf?.hasVariant.map((s) => s.gtin) || [],
    skuStock: product.isVariantOf?.hasVariant.reduce((result, sku) => {
      if (sku.offers?.offers?.[0]?.inventoryLevel.value) {
        // @ts-expect-error nao faz sentido
        result[sku.id!] = sku.offers?.offers?.[0]?.inventoryLevel.value;
      }
      return result;
    }, {} as Record<string, number>),
    productName: product.isVariantOf?.name,
    brand: product.brand,
    brandId: product.brand,
    productDepartmentId: departament?.propertyID,
    productDepartmentName: departament?.value,
    productCategoryId: category?.propertyID,
    productCategoryName: category?.value,
    productListPriceFrom: lowestOffer?.[0]?.price,
    productListPriceTo: highestOffer?.[0]?.price,
    productPriceFrom: lowestOffer?.[1]?.price,
    productPriceTo: highestOffer?.[1]?.price,
    sellerId: offers?.map(({ seller }) => seller)?.[0],
    sellerIds: offers?.map(({ seller }) => seller),
  };

  return (
    <script
      {...props}
      defer
      src={useScriptAsDataURI((t) => {
        globalThis.window.datalayer_product = t;
      }, template)}
    />
  );
}

interface ProductInfoProps extends ScriptProps {
  product: Product;
}

export function ProductInfo({ product, ...props }: ProductInfoProps) {
  if (!product.isVariantOf?.productGroupID) return null;
  return (
    <script
      {...props}
      defer
      data-product-info
      src={useScriptAsDataURI((t) => {
        globalThis.window.shelfProductIds = globalThis.window.shelfProductIds ||
          [];
        globalThis.window.shelfProductIds.push(t);
      }, product.isVariantOf.productGroupID)}
    />
  );
}

export interface ProductSKUJsonProps extends ScriptProps {
  product: unknown;
}
export function ProductSKUJson({ product, ...props }: ProductSKUJsonProps) {
  return (
    <script
      {...props}
      defer
      src={useScriptAsDataURI((p) => {
        globalThis.window.skuJson = p;
      }, product)}
    />
  );
}
