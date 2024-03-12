export interface Tag {
    name: string
    title: string
    subtitle: string
    description: string
    importance: number
    type: string
    image_url: string
}
  
  interface Installment {
    number: number;
    price: number;
    interest: boolean;
    interest_rate: number;
    total: number;
  }
  
  interface Image {
    sku: string | null;
    url: string;
  }
  
  export interface VNDAProduct {
    active: boolean;
    available: boolean;
    reference: string;
    name: string;
    description: string;
    price: number;
    on_sale: boolean;
    sale_price: number;
    updated_at: string;
    image_url: string;
    url: string;
    tags: Tag[];
    instalments: Installment[];
    images: Image[];
    color_variants: string[];
    size_variants: string[];
    objectID: string;
  }
  
  export interface OfferProps {
        price: number;
        sale_price: number;
        intl_price?: number,
        available_quantity: number,
        available: boolean,
        installments: Installment[],
  }