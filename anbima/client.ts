// Tipos para os endpoints da ANBIMA - Títulos Públicos

// Mercado Secundário
export interface MercadoSecundarioTituloPublico {
  tipo_titulo: string;
  expressao: string;
  data_vencimento: string; // YYYY-MM-DD
  data_referencia: string; // YYYY-MM-DD
  codigo_selic: string;
  data_base: string; // YYYY-MM-DD
  taxa_compra: number;
  taxa_venda: number;
  taxa_indicativa: number;
  intervalo_min_d0: number;
  intervalo_max_d0: number;
  intervalo_min_d1: number;
  intervalo_max_d1: number;
  pu: number;
  desvio_padrao: number;
  codigo_isin: string;
}

// VNA
export interface VnaTituloPublico {
  data_referencia: string;
  tipo_titulo: string;
  codigo_selic: string;
  index: number;
  tipo_correcao: string;
  data_validade: string;
  vna: number;
}

// Curvas de Juros
export interface CurvaJuros {
  data_referencia: string;
  parametros: {
    grupo_indexador: string;
    b1: number;
    b2: number;
    b3: number;
    b4: number;
    l1: number;
    l2: number;
  }[];
  erros: {
    tipo_titulo: string;
    codigo_selic: string;
    data_vencimento: string;
    valor_erro: number;
  }[];
  ettj: {
    vertice_du: number;
    taxa_prefixadas: number;
    taxa_ipca: number;
    taxa_implicita: number;
  }[];
  circular_3361: {
    vertice_du: number;
    taxa: number;
  }[];
}

// Curva Intradiária
export interface CurvaIntradiaria {
  data_referencia: string;
  grupo_indexador: string;
  taxa: number;
  vertice: number;
}

// PU Intradiário
export interface PuIntradiario {
  data_referencia: string;
  tipo_titulo: string;
  codigo_selic: string;
  data_vencimento: string;
  taxa_intradiaria: number;
  pu: number;
  tipo_pu: string;
}

// Difusão de Taxas
export interface DifusaoTaxas {
  tipo_titulo: string;
  data_vencimento: string;
  codigo_isin: string;
  provedor_info: string;
  data_referencia: string;
  horario: string;
  taxa_ind_d1: number;
  taxa_negocio: number;
  taxa_compra: number;
  taxa_venda: number;
  intervalo_ind_max: number;
  intervalo_ind_min: number;
}

// Estimativa SELIC
export interface EstimativaSelic {
  data_referencia: string;
  estimativa_taxa_selic: number;
}

// Projeções IPCA e IGP-M
export interface Projecoes {
  indice: string;
  tipo_projecao: string;
  data_coleta: string;
  mes_referencia: string;
  variacao_projetada: number;
  data_validade: string;
}

// Interface do client
export interface AnbimaTitulosPublicosClient {
  // Mercado Secundário
  "GET /feed/precos-indices/v1/titulos-publicos/mercado-secundario-TPF": {
    response: MercadoSecundarioTituloPublico[];
    searchParams?: { data?: string };
  };
  // VNA
  "GET /feed/precos-indices/v1/titulos-publicos/vna": {
    response: VnaTituloPublico[];
    searchParams?: { data?: string };
  };
  // Curvas de Juros
  "GET /feed/precos-indices/v1/titulos-publicos/curvas-juros": {
    response: CurvaJuros[];
    searchParams?: { data?: string };
  };
  // Curva Intradiária
  "GET /feed/precos-indices/v1/titulos-publicos/curva-intradiaria": {
    response: CurvaIntradiaria[];
    searchParams?: { data?: string };
  };
  // PU Intradiário
  "GET /feed/precos-indices/v1/titulos-publicos/pu-intradiario": {
    response: PuIntradiario[];
    searchParams?: { data?: string };
  };
  // Difusão de Taxas
  "GET /feed/precos-indices/v1/titulos-publicos/difusao-taxas": {
    response: DifusaoTaxas[];
    searchParams?: { data?: string };
  };
  // Estimativa SELIC
  "GET /feed/precos-indices/v1/titulos-publicos/estimativa-selic": {
    response: EstimativaSelic[];
    searchParams?: { data?: string };
  };
  // Projeções IPCA e IGP-M
  "GET /feed/precos-indices/v1/titulos-publicos/projecoes": {
    response: Projecoes[];
    searchParams?: { mes?: string; ano?: string };
  };
} 