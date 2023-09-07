export interface ProductCategoryResult {
    filtersOrdered: string[];
    basePath:       string;
    meta:           Meta;
    appliedFilters: any[];
    headerColors:   HeaderColors;
    productCards:   ProductCard[];
    skusTotal:      number;
    sidebar:        Sidebar[];
    breadcrumbs:    Array<any[] | BreadcrumbClass>;
    miniVms:        any[];
}

export interface BreadcrumbClass {
    name:     string;
    path:     null | string;
    position: number;
}

export interface HeaderColors {
    foregroundColor:     null;
    backgroundColorFrom: null;
    backgroundColorTo:   null;
}

export interface Meta {
    index:         boolean;
    title:         string;
    description:   string;
    shareImageUrl: null;
    header:        string;
    sidebarText:   null;
    footerText:    string;
}

export interface ProductCard {
    url:           string;
    title:         string;
    sku:           string;
    size:          Size;
    brand:         Brand;
    segment:       Segment;
    macroCategory: string;
    category:      string;
    image:         string;
    hoverImage:    string;
    price:         Price;
    cashback:      null;
    tags:          Tags;
    available:     boolean;
}

export enum Brand {
    CasaMoysés = "casa moysés",
    Mmartan = "mmartan",
    MmartanPetit = "mmartan Petit",
}

export interface Price {
    min:  number;
    max:  number;
    type: number;
}

export enum Segment {
    Cama = "Cama",
}

export enum Size {
    Casal = "Casal",
    Queen = "Queen",
    Solteiro = "Solteiro",
    SolteiroKing = "Solteiro King",
    SolteiroSuperKing = "Solteiro Super King",
    Standard = "Standard",
}

export interface Tags {
    topLeft?: TopLeft;
    bottom?:  Bottom;
}

export interface Bottom {
    type: string;
}

export interface TopLeft {
    type:   TopLeftType;
    value?: string;
}

export enum TopLeftType {
    Lancamento = "LANCAMENTO",
    Promotion = "PROMOTION",
}

export interface Sidebar {
    filterType:  FilterTypeEnum;
    filterLabel: string;
    valuePrefix: null | string;
    values:      Value[];
}

export enum FilterTypeEnum {
    BaseColor = "baseColor",
    BedSize = "bedSize",
    BrandName = "brandName",
    Category = "category",
    PillowSize = "pillowSize",
}

export interface Value {
    type:      FilterTypeEnum;
    slug:      string;
    value:     string;
    hex?:      string;
    colorUrl?: string;
}
