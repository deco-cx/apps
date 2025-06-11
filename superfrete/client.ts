// Interfaces baseadas na documentação da API SuperFrete

// Interfaces de entrada para cotação de frete
export interface FromTo {
  postal_code: string;
}

export interface Options {
  own_hand?: boolean;
  receipt?: boolean;
  insurance_value?: number;
  use_insurance_value?: boolean;
}

export interface Package {
  weight: number;
  height: number;
  width: number;
  length: number;
}

export interface Product {
  quantity?: number;
  weight: number;
  height: number;
  width: number;
  length: number;
}

export interface FreightQuoteRequest {
  from: FromTo;
  to: FromTo;
  services: string; // "1,2,17" etc
  options: Options;
  package?: Package;
  products?: Product[];
}

// Interfaces de resposta
export interface FreightService {
  id: number;
  name: string;
  price: number;
  company: {
    id: number;
    name: string;
  };
  delivery_range: {
    min: number;
    max: number;
  };
  packages: Package[];
  additional_services: {
    receipt: boolean;
    own_hand: boolean;
    collect: boolean;
  };
  error?: string;
}

export interface FreightQuoteResponse {
  carrier: {
    name: string;
    slug: string;
    discount: number;
  };
  services: FreightService[];
}

export interface ServiceInfo {
  id: number;
  name: string;
  status: boolean;
  type: string;
  range: string;
  restrictions: string;
  requirements: string;
  optionals: string;
  observations: string;
}

export interface ShippingRequest {
  service: number;
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    company_document?: string;
    state_register?: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    country_id: string;
    postal_code: string;
    note?: string;
  };
  products: Product[];
  volumes: Package[];
  options: Options;
}

export interface Order {
  id: string;
  protocol: string;
  status: string;
  tracking: string;
  order_id: string;
  invoice: {
    key: string;
  };
  tags: Array<{
    tag: string;
    url: string;
  }>;
}

export interface OrderInfo {
  id: string;
  protocol: string;
  status: string;
  tracking: string;
  created_at: string;
  shipped_date?: string;
  delivered_date?: string;
  service: {
    id: number;
    name: string;
  };
  from: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    number: string;
    district: string;
    city: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    number: string;
    district: string;
    city: string;
    postal_code: string;
  };
  products: Product[];
  volumes: Package[];
  tracking_events?: Array<{
    date: string;
    hour: string;
    location: string;
    status: string;
    observation: string;
  }>;
}

export interface Address {
  id: string;
  label: string;
  receiver: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  complement?: string;
  number: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  document: string;
  company_document?: string;
  addresses: Address[];
}

export interface WebhookApp {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

// Interface do cliente SuperFrete
export interface SuperFreteClient {
  // Cotação de frete
  "POST /api/v0/calculator": {
    response: FreightQuoteResponse;
    body: FreightQuoteRequest;
  };

  // Informações dos serviços/pacotes
  "GET /api/v0/services/info": {
    response: ServiceInfo[];
  };

  // Enviar frete para a SuperFrete
  "POST /api/v0/quote/checkout": {
    response: Order;
    body: ShippingRequest;
  };

  // Finalizar pedido e gerar etiqueta
  "POST /api/v0/orders/:order_id/generate": {
    response: Order;
  };

  // Informações do pedido
  "GET /api/v0/orders/:order_id": {
    response: OrderInfo;
  };

  // Link para impressão da etiqueta
  "POST /api/v0/orders/:order_id/print": {
    response: {
      url: string;
    };
  };

  // Cancelar pedido
  "POST /api/v0/orders/:order_id/cancel": {
    response: {
      message: string;
    };
  };

  // Listar endereços
  "GET /api/v0/addresses": {
    response: Address[];
  };

  // Buscar informações do usuário
  "GET /api/v0/user": {
    response: User;
  };

  // Webhook operations
  "POST /api/v0/webhooks": {
    response: WebhookApp;
    body: {
      url: string;
      events: string[];
    };
  };

  "GET /api/v0/webhooks": {
    response: WebhookApp[];
  };

  "PUT /api/v0/webhooks/:webhook_id": {
    response: WebhookApp;
    body: {
      url?: string;
      events?: string[];
      is_active?: boolean;
    };
  };

  "DELETE /api/v0/webhooks/:webhook_id": {
    response: {
      message: string;
    };
  };
}
