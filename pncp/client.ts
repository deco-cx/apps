// PNCP API Client Types and Interfaces

export interface PNCPSearchParams {
  /** Tipos de documento (edital, contrato, ata, etc.) */
  tipos_documento?: string;
  /** Ordenação dos resultados (-data, data, -valor, valor) */
  ordenacao?: string;
  /** Número da página */
  pagina?: number;
  /** Tamanho da página (quantidade de registros por página) */
  tam_pagina?: number;
  /** Status do documento (recebendo_proposta, encerrado, etc.) */
  status?: string;
  /** Texto livre para busca */
  q?: string;
  /** CNPJ do órgão */
  cnpj_orgao?: string;
  /** UF do órgão */
  uf?: string;
  /** Município */
  municipio?: string;
  /** Valor mínimo */
  valor_min?: number;
  /** Valor máximo */
  valor_max?: number;
  /** Data inicial (formato YYYY-MM-DD) */
  data_inicial?: string;
  /** Data final (formato YYYY-MM-DD) */
  data_final?: string;
}

export interface PNCPDocumento {
  /** Identificador único do documento */
  id: string;
  /** Número do documento */
  numero: string;
  /** Tipo do documento */
  tipo: string;
  /** Título/objeto do documento */
  titulo: string;
  /** Descrição detalhada */
  descricao?: string;
  /** Data de publicação */
  data_publicacao: string;
  /** Data de abertura */
  data_abertura?: string;
  /** Data de encerramento */
  data_encerramento?: string;
  /** Status atual */
  status: string;
  /** Valor estimado */
  valor_estimado?: number;
  /** Modalidade de licitação */
  modalidade?: string;
  /** Critério de julgamento */
  criterio_julgamento?: string;
  /** Informações do órgão */
  orgao: {
    nome: string;
    cnpj: string;
    uf: string;
    municipio: string;
  };
  /** Link para o documento completo */
  link_documento?: string;
  /** Anexos */
  anexos?: Array<{
    nome: string;
    url: string;
    tamanho?: number;
    tipo?: string;
  }>;
}

export interface PNCPSearchResponse {
  /** Total de registros encontrados */
  total: number;
  /** Página atual */
  pagina: number;
  /** Registros por página */
  tam_pagina: number;
  /** Total de páginas */
  total_paginas: number;
  /** Lista de documentos */
  dados: PNCPDocumento[];
}

export interface PNCPOrgao {
  /** CNPJ do órgão */
  cnpj: string;
  /** Nome do órgão */
  nome: string;
  /** UF */
  uf: string;
  /** Município */
  municipio: string;
  /** Esfera (federal, estadual, municipal) */
  esfera: string;
  /** Poder (executivo, legislativo, judiciário) */
  poder: string;
  /** Email de contato */
  email?: string;
  /** Telefone */
  telefone?: string;
  /** Site */
  site?: string;
}

export interface PNCPOrgaoResponse {
  /** Lista de órgãos */
  dados: PNCPOrgao[];
  /** Total de registros */
  total: number;
}

export interface PNCPEstatisticas {
  /** Total de documentos */
  total_documentos: number;
  /** Total de órgãos */
  total_orgaos: number;
  /** Total de fornecedores */
  total_fornecedores: number;
  /** Valor total das contratações */
  valor_total_contratacoes: number;
  /** Estatísticas por tipo de documento */
  por_tipo: Record<string, number>;
  /** Estatísticas por UF */
  por_uf: Record<string, number>;
  /** Estatísticas por status */
  por_status: Record<string, number>;
}

// Client interface following the createHttpClient pattern
export interface PNCPClient {
  /** Buscar documentos/processos */
  "GET /api/search": {
    response: PNCPSearchResponse;
    searchParams: PNCPSearchParams;
  };

  /** Obter detalhes de um documento específico */
  "GET /api/documento/:id": {
    response: PNCPDocumento;
  };

  /** Listar órgãos */
  "GET /api/orgaos": {
    response: PNCPOrgaoResponse;
    searchParams: {
      /** UF para filtrar */
      uf?: string;
      /** Esfera para filtrar */
      esfera?: string;
      /** Poder para filtrar */
      poder?: string;
      /** Texto para busca */
      q?: string;
      /** Número da página */
      pagina?: number;
      /** Registros por página */
      tam_pagina?: number;
    };
  };

  /** Obter detalhes de um órgão específico */
  "GET /api/orgao/:cnpj": {
    response: PNCPOrgao;
  };

  /** Obter estatísticas gerais */
  "GET /api/estatisticas": {
    response: PNCPEstatisticas;
    searchParams: {
      /** Data inicial para filtrar estatísticas */
      data_inicial?: string;
      /** Data final para filtrar estatísticas */
      data_final?: string;
      /** UF para filtrar estatísticas */
      uf?: string;
    };
  };
}