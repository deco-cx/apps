// Interfaces baseadas na especificação OpenAPI da BrasilAPI

// Interfaces de resposta
export interface Bank {
  ispb: string;
  name: string;
  code: number;
  fullName: string;
}

export interface Address {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export interface AddressV2 extends Omit<Address, "service"> {
  service: string;
  location: {
    type: "Point";
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

export interface CepError {
  name: string;
  message: string;
  type: string;
  errors: Array<{
    name: string;
    message: string;
    service: string;
  }>;
}

export interface CNPJ {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_exterior: string | null;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_de_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: number;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1: string;
  ddd_telefone_2: string | null;
  ddd_fax: string | null;
  qualificacao_do_responsavel: number;
  capital_social: number;
  porte: number;
  descricao_porte: string;
  opcao_pelo_simples: boolean;
  data_opcao_pelo_simples: string | null;
  data_exclusao_do_simples: string | null;
  opcao_pelo_mei: boolean;
  situacao_especial: string | null;
  data_situacao_especial: string | null;
  cnaes_secundarios: Array<{
    codigo: number;
    descricao: string;
  }>;
  qsa: Array<{
    identificador_de_socio: number;
    nome_socio: string;
    cnpj_cpf_do_socio: string;
    codigo_qualificacao_socio: number;
    percentual_capital_social: number;
    data_entrada_sociedade: string;
    cpf_representante_legal: string | null;
    nome_representante_legal: string | null;
    codigo_qualificacao_representante_legal: string | null;
  }>;
}

export interface DDDInfo {
  state: string;
  cities: string[];
}

export interface State {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

export interface Holiday {
  date: string;
  name: string;
  type: string;
}

export interface Fipe {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
  tipoVeiculo: number;
  siglaCombustivel: string;
  dataConsulta: string;
}

export interface TabelaFIPE {
  codigo: number;
  mes: string;
}

export interface MarcaFIPE {
  nome: string;
  valor: number;
}

export interface VeiculoMarcaFIPE {
  modelo: string;
}

export interface Corretora {
  cnpj: string;
  nome_social: string;
  nome_comercial: string;
  bairro: string;
  cep: string;
  codigo_cvm: string;
  complemento: string;
  data_inicio_situacao: string;
  data_patrimonio_liquido: string;
  data_registro: string;
  email: string;
  logradouro: string;
  municipio: string;
  pais: string;
  telefone: string;
  uf: string;
  valor_patrimonio_liquido: string;
}

export interface City {
  nome: string;
  estado: string;
  id: number;
}

export interface NCM {
  codigo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  tipo_ato: string;
  numero_ato: string;
  ano: string;
}

export interface PIX_PARTICIPANTES {
  ispb: string;
  nome: string;
  nome_reduzido: string;
  modalidade_participacao: string;
  tipo_participacao: string;
  inicio_operacao: string;
}

export interface Taxa {
  nome: string;
  valor: number;
}

export interface REGISTROBR {
  status_code: number;
  status: string;
  fqdn: string;
  suggestions?: string[];
  hosts?: string[];
  "publication-status"?: string;
  "expires-at"?: string;
  reasons?: string[];
}

export interface CambioMoeda {
  simbolo: string;
  nome: string;
  tipo_moeda: string;
}

export interface Cotacao {
  paridade_compra: number;
  paridade_venda: number;
  cotacao_compra: number;
  cotacao_venda: number;
  data_hora_cotacao: string;
  tipo_boletim: string;
}

export interface CambioRetorno {
  moeda: string;
  data: string;
  cotacoes: Cotacao[];
}

// Interface do cliente HTTP para a BrasilAPI
export interface BrasilAPIClient {
  // CEP
  "GET /cep/v1/:cep": {
    response: Address;
  };

  "GET /cep/v2/:cep": {
    response: AddressV2;
  };

  // Bancos
  "GET /banks/v1": {
    response: Bank[];
  };

  "GET /banks/v1/:code": {
    response: Bank;
  };

  // CNPJ
  "GET /cnpj/v1/:cnpj": {
    response: CNPJ;
  };

  // DDD
  "GET /ddd/v1/:ddd": {
    response: DDDInfo;
  };

  // IBGE
  "GET /ibge/uf/v1": {
    response: State[];
  };

  "GET /ibge/uf/v1/:code": {
    response: State;
  };

  "GET /ibge/municipios/v1/:siglaUF": {
    response: Array<{ nome: string; codigo_ibge: string }>;
    searchParams?: {
      providers?: string;
    };
  };

  // Feriados
  "GET /feriados/v1/:ano": {
    response: Holiday[];
  };

  // FIPE
  "GET /fipe/tabelas/v1": {
    response: TabelaFIPE[];
  };

  "GET /fipe/marcas/v1/:tipoVeiculo": {
    response: MarcaFIPE[];
    searchParams?: {
      tabela_referencia?: number;
    };
  };

  "GET /fipe/preco/v1/:codigoFipe": {
    response: Fipe[];
    searchParams?: {
      tabela_referencia?: number;
    };
  };

  "GET /fipe/veiculos/v1/:tipoVeiculo/:codigoMarca": {
    response: VeiculoMarcaFIPE[];
    searchParams?: {
      tabela_referencia?: number;
    };
  };

  // Corretoras
  "GET /cvm/corretoras/v1": {
    response: Corretora[];
  };

  "GET /cvm/corretoras/v1/:cnpj": {
    response: Corretora;
  };

  // CPTEC
  "GET /cptec/v1/cidade": {
    response: City[];
  };

  "GET /cptec/v1/cidade/:cityName": {
    response: City[];
  };

  // NCM
  "GET /ncm/v1": {
    response: NCM[];
  };

  "GET /ncm/v1/:code": {
    response: NCM;
  };

  // PIX
  "GET /pix/v1/participants": {
    response: PIX_PARTICIPANTES[];
  };

  // Registro BR
  "GET /registrobr/v1/:domain": {
    response: REGISTROBR;
  };

  // Taxas
  "GET /taxas/v1": {
    response: Taxa[];
  };

  "GET /taxas/v1/:sigla": {
    response: Taxa;
  };

  // Câmbio
  "GET /cambio/v1/moedas": {
    response: CambioMoeda[];
  };

  "GET /cambio/v1/cotacao/:moeda/:data": {
    response: CambioRetorno;
  };
}
