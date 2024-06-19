export type Sort =
  | "relevance"
  | "topRated"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"

export type FieldsList = "BASIC" | "DEFAULT" | "FULL"

export interface Facet {
  key: string
  value: string
}

export interface Stock {
  isValueRounded: boolean
  stockLevel: number
  stockLevelStatus: string
}

export interface VariantOptionQualifier {
  name: string
  qualifier: string
  value: string
  image: {
    altText: string
    format: string
    galleryIndex: number
    imageType: string
    url: string
  }
}

export interface VariantOption {
  code: string
  priceData: PriceData
  stock: Stock
  url: string
  variantOptionQualifiers: VariantOptionQualifier[]
}

export interface PriceData {
  currencyIso: string
  value: number
  formattedValue: string
  priceType: string
}

export interface Category {
  code: string
  image: {
    altText: string
    format: string
    galleryIndex: number
    imageType: string
    url: string
  }
  name: string
  url: string
}

export interface ProductClassification {
  code: string
  features: {
    code: string
    comparable: boolean
    description: string
    featureUnit: {
      name: string
      symbol: string
      unitType: string
    }
    featureValues: {
      value: string
    }[]
    name: string
    range: boolean
    type: string
  }
  name: string
}

export interface Promotion {
  code: string
  couldFireMessages: string[]
  description: string
  enabled: boolean
  endDate: Date
  firedMessages: string[]
  priority: number
  productBanner: {
    altText: string
    format: string
    galleryIndex: number
    imageType: string
    url: string
  }
  promotionGroup: string
  promotionType: string
  restrictions: {
    description: string
    restrictionType: string
  }
  startDate: Date
  title: string
}

export interface Review {
  alias: string
  comment: string
  date: Date
  headline: string
  id: string
  principal: {
    active: boolean
    approvers: string[]
    currency: {
      active: boolean
      isocode: string
      name: string
      symbol: string
    }
    customerId: string
    deactivationDate: Date
    defaultAddress: {
      cellphone: string
      city: {
        isocode: string
        name: string
      }
      cityDistrict: {
        isocode: string
        name: string
      }
      companyName: string
      country: {
        isocode: string
        name: string
      }
      defaultAddress: boolean
      district: string
      email: string
      firstName: string
      formattedAddress: string
      id: string
      lastName: string
      line1: string
      line2: string
      phone: string
      postalCode: string
      region: {
        countryIso: string
        isocode: string
        isocodeShort: string
        name: string
      }
      shippingAddress: boolean
      title: string
      titleCode: string
      town: string
      visibleInAddressBook: boolean
    }
  }
}

export interface VariantMatrix {
  elements: string[]
  isLeaf: boolean
  parentVariantCategory: {
    hasImage: boolean
    name: string
    priority: number
  }
  variantOption: {
    code: string
    priceData: PriceData
    stock: Stock
    url: string
    variantOptionQualifiers: VariantOptionQualifier[]
    variantValueCategory: {
      name: string
      sequence: number
      superCategories: {
        hasImage: boolean
        name: string
        priority: number
      }[]
    }
  }
}

export interface Product {
  availableForPickup: boolean
  averageRating: number
  baseProduct: string
  categories: Category[]
  classifications: ProductClassification[]
  code: string
  configurable: boolean
  configuratorType: string
  description: string
  firstVariantCode: string
  firstVariantImage: string
  futureStocks: {
    date: Date
    formattedDate: string
    stock: Stock
  }[]
  images: {
    altText: string
    format: string
    galleryIndex: number
    imageType: string
    url: string
  }[]
  manufacturer: string
  multidimensional: string
  name: string
  numberOfReviews: number
  Promotions: Promotion[]
  price: PriceData
  priceRange: {
    maxPrice: PriceData
    minPrice: PriceData
  }
  productReferences: {
    description: string,
    preselected: boolean,
    quantity: number,
    referenceType: string
  }
  purchasable: boolean
  reviews: Review[]
  stock: Stock
  summary: string
  tags: string[]
  url: string
  variantMatrix: VariantMatrix[]
  variantOption: VariantOption[]
  variantType: string
  volumePrices: PriceData[]
  volumePricesFlag: boolean
}

export interface SearchSort {
  code: string
  name: string
  selected: boolean
}

export interface Pagination {
  currentPage: number
  pageSize: number
  sort: string
  totalPages: number
  totalResults: number
}

export interface Breadcrumb {
  facetCode: string
  facetName: string
  facetValueCode: string
  facetValueName: string
  removeQuery: {
    query: {
      value: string
    }
    url: string
  }
  truncateQuery: {
    query: {
      value: string
    }
    url: string
  }
}

export interface FacetResponse {
  category: boolean
  multiSelect: boolean
  name: string
  priority: number
  topValues: [
    {
      count: number
      name: string
      query: {
        query: {
          value: string
        }
        url: string
      }
      selected: boolean
    }
  ]
  values: [
    {
      count: number
      name: string
      query: {
        query: {
          value: string
        }
        url: string
      }
      selected: boolean
    }
  ]
  visible: boolean
}

export interface SearchResponse {
  breadcrumbs: Breadcrumb[]
  type: string
  currentQuery: {
    query: {
      value: string
    }
    url: string
  }
  facets: FacetResponse[]
  freeTextSearch: string
  keywordRedirectUrl: string
  pagination: Pagination
  products: Product[]
  sorts: SearchSort[]
  spellingSuggestion: {
    query: string
    suggestion: string
  }
}

export interface ProductListResponse extends SearchResponse {
  categoryCode: string
}

export interface ProductDetailsOption {
  code: string
  priceData: PriceData
  stock: Stock
  url: string
  variantOptionQualifiers: VariantOptionQualifier[]
}

export interface ProductDetailsBaseOption {
  options: ProductDetailsOption[]
  selected: ProductDetailsOption & { variantType: string }
  variantType: string
}

export interface ProductDetailsResponse extends Product {
  baseOptions: ProductDetailsBaseOption[]
  bundleTemplates: {
    id: string
    name: string
    rootBundleTemplateName: string
  }[]
  timedAccessPromotion: Promotion[]
}

export interface Brand {
  id: string
  name: string
  url: string
}

export interface Category extends Brand {
  subcategories: Category[]
}

export interface Collection extends Category { }

export interface CatalogVersion {
  categories: Category[]
  id: "Staged" | "Online"
  url: string
}

export interface Catalogs {
  catalogVersions: CatalogVersion[]
  id: string
  name: string
  url: string
}

export interface CatalogsResponse {
  catalogs: Catalogs
}
