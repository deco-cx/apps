// Based on the OpenAPI specification from docs.json
// API REST de serviços do Portal Nacional de Contratações Públicas (PNCP)

// Search API Types (for the original search endpoint)
export interface Compra {
  id: string;
  index: string;
  doc_type: string;
  title: string;
  description: string;
  item_url: string;
  document_type: string;
  createdAt: string;
  numero: string | null;
  ano: string;
  numero_sequencial: string;
  numero_sequencial_compra_ata: string | null;
  numero_controle_pncp: string;
  orgao_id: string;
  orgao_cnpj: string;
  orgao_nome: string;
  orgao_subrogado_id: string | null;
  orgao_subrogado_nome: string | null;
  unidade_id: string;
  unidade_codigo: string;
  unidade_nome: string;
  esfera_id: string;
  esfera_nome: string;
  poder_id: string;
  poder_nome: string;
  municipio_id: string;
  municipio_nome: string;
  uf: string;
  modalidade_licitacao_id: string;
  modalidade_licitacao_nome: string;
  situacao_id: string;
  situacao_nome: string;
  data_publicacao_pncp: string;
  data_atualizacao_pncp: string;
  data_assinatura: string | null;
  data_inicio_vigencia: string;
  data_fim_vigencia: string;
  cancelado: boolean;
  valor_global: number | null;
  tem_resultado: boolean;
  tipo_id: string;
  tipo_nome: string;
  tipo_contrato_id: string | null;
  tipo_contrato_nome: string | null;
  fonte_orcamentaria: string | null;
  fonte_orcamentaria_id: string | null;
  fonte_orcamentaria_nome: string | null;
  exigencia_conteudo_nacional: boolean;
  tipo_margem_preferencia: string | null;
  tipo_margem_preferencia_id: string | null;
  tipo_margem_preferencia_nome: string | null;
}

export interface SearchResults {
  items: Compra[];
  total: number;
}

// Error Response Types
export interface RespostaErroValidacaoDTO {
  message?: string;
  path?: string;
  timestamp?: string;
  status?: string;
  error?: string;
}

// Pagination Types
export interface PaginaRetornoBase<T> {
  data: T[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

// Plano de Contratação Types
export interface PlanoContratacaoItemDTO {
  descricaoItem?: string;
  nomeClassificacaoCatalogo?: string;
  quantidadeEstimada?: number;
  pdmCodigo?: string;
  dataInclusao?: string;
  numeroItem?: number;
  dataAtualizacao?: string;
  valorTotal?: number;
  pdmDescricao?: string;
  codigoItem?: string;
  unidadeRequisitante?: string;
  grupoContratacaoCodigo?: string;
  grupoContratacaoNome?: string;
  classificacaoSuperiorCodigo?: string;
  classificacaoSuperiorNome?: string;
  unidadeFornecimento?: string;
  valorUnitario?: number;
  valorOrcamentoExercicio?: number;
  dataDesejada?: string;
  categoriaItemPcaNome?: string;
  classificacaoCatalogoId?: number;
}

export interface PlanoContratacaoComItensDoUsuarioDTO {
  itens?: PlanoContratacaoItemDTO[];
  codigoUnidade?: string;
  nomeUnidade?: string;
  anoPca?: number;
  orgaoEntidadeRazaoSocial?: string;
  orgaoEntidadeCnpj?: string;
  idPcaPncp?: string;
  dataPublicacaoPNCP?: string;
  dataAtualizacaoGlobalPCA?: string;
}

export type PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO =
  PaginaRetornoBase<PlanoContratacaoComItensDoUsuarioDTO>;

// Orgão/Entidade Types
export interface RecuperarOrgaoEntidadeDTO {
  cnpj?: string;
  razaoSocial?: string;
  poderId?: string;
  esferaId?: string;
}

export interface RecuperarUnidadeOrgaoDTO {
  ufNome?: string;
  codigoIbge?: string;
  codigoUnidade?: string;
  nomeUnidade?: string;
  ufSigla?: string;
  municipioNome?: string;
}

// Contratação Types
export interface ContratacaoFonteOrcamentariaDTO {
  codigo?: number;
  nome?: string;
  descricao?: string;
  dataInclusao?: string;
}

export interface RecuperarAmparoLegalDTO {
  descricao?: string;
  nome?: string;
  codigo?: number;
}

export interface RecuperarCompraDTO {
  valorTotalEstimado?: number;
  valorTotalHomologado?: number;
  orcamentoSigilosoCodigo?: number;
  orcamentoSigilosoDescricao?: string;
  numeroControlePNCP?: string;
  linkSistemaOrigem?: string;
  linkProcessoEletronico?: string;
  anoCompra?: number;
  sequencialCompra?: number;
  numeroCompra?: string;
  processo?: string;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  modalidadeId?: number;
  modalidadeNome?: string;
  justificativaPresencial?: string;
  modoDisputaId?: number;
  modoDisputaNome?: string;
  tipoInstrumentoConvocatorioCodigo?: number;
  tipoInstrumentoConvocatorioNome?: string;
  amparoLegal?: RecuperarAmparoLegalDTO;
  objetoCompra?: string;
  informacaoComplementar?: string;
  srp?: boolean;
  fontesOrcamentarias?: ContratacaoFonteOrcamentariaDTO[];
  dataPublicacaoPncp?: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  situacaoCompraId?: "1" | "2" | "3" | "4";
  situacaoCompraNome?: string;
  existeResultado?: boolean;
  dataInclusao?: string;
  dataAtualizacao?: string;
  dataAtualizacaoGlobal?: string;
  usuarioNome?: string;
}

export interface RecuperarCompraPublicacaoDTO {
  numeroControlePNCP?: string;
  dataAtualizacaoGlobal?: string;
  modalidadeId?: number;
  srp?: boolean;
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  anoCompra?: number;
  sequencialCompra?: number;
  dataInclusao?: string;
  dataPublicacaoPncp?: string;
  dataAtualizacao?: string;
  numeroCompra?: string;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  amparoLegal?: RecuperarAmparoLegalDTO;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  informacaoComplementar?: string;
  processo?: string;
  objetoCompra?: string;
  linkSistemaOrigem?: string;
  justificativaPresencial?: string;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  valorTotalHomologado?: number;
  modoDisputaId?: number;
  linkProcessoEletronico?: string;
  valorTotalEstimado?: number;
  modalidadeNome?: string;
  modoDisputaNome?: string;
  tipoInstrumentoConvocatorioCodigo?: number;
  tipoInstrumentoConvocatorioNome?: string;
  fontesOrcamentarias?: ContratacaoFonteOrcamentariaDTO[];
  situacaoCompraId?: "1" | "2" | "3" | "4";
  situacaoCompraNome?: string;
  usuarioNome?: string;
}

export type PaginaRetornoRecuperarCompraPublicacaoDTO = PaginaRetornoBase<
  RecuperarCompraPublicacaoDTO
>;

// Contrato Types
export interface Categoria {
  id?: number;
  nome?: string;
}

export interface TipoContrato {
  id?: number;
  nome?: string;
}

export interface RecuperarContratoDTO {
  numeroControlePncpCompra?: string;
  codigoPaisFornecedor?: string;
  numeroControlePNCP?: string;
  receita?: boolean;
  numeroParcelas?: number;
  numeroRetificacao?: number;
  tipoPessoaSubContratada?: "PJ" | "PF" | "PE";
  objetoContrato?: string;
  valorInicial?: number;
  valorParcela?: number;
  valorGlobal?: number;
  valorAcumulado?: number;
  dataAtualizacaoGlobal?: string;
  identificadorCipi?: string;
  urlCipi?: string;
  anoContrato?: number;
  tipoContrato?: TipoContrato;
  numeroContratoEmpenho?: string;
  dataAssinatura?: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  niFornecedor?: string;
  tipoPessoa?: "PJ" | "PF" | "PE";
  orgaoEntidade?: RecuperarOrgaoEntidadeDTO;
  categoriaProcesso?: Categoria;
  dataPublicacaoPncp?: string;
  dataAtualizacao?: string;
  sequencialContrato?: number;
  unidadeOrgao?: RecuperarUnidadeOrgaoDTO;
  informacaoComplementar?: string;
  processo?: string;
  unidadeSubRogada?: RecuperarUnidadeOrgaoDTO;
  orgaoSubRogado?: RecuperarOrgaoEntidadeDTO;
  nomeRazaoSocialFornecedor?: string;
  niFornecedorSubContratado?: string;
  nomeFornecedorSubContratado?: string;
  usuarioNome?: string;
}

export type PaginaRetornoRecuperarContratoDTO = PaginaRetornoBase<
  RecuperarContratoDTO
>;

// Ata Types
export interface AtaRegistroPrecoPeriodoDTO {
  numeroControlePNCPAta?: string;
  numeroAtaRegistroPreco?: string;
  anoAta?: number;
  numeroControlePNCPCompra?: string;
  cancelado?: boolean;
  dataCancelamento?: string;
  dataAssinatura?: string;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  dataPublicacaoPncp?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  dataAtualizacaoGlobal?: string;
  usuario?: string;
  objetoContratacao?: string;
  cnpjOrgao?: string;
  nomeOrgao?: string;
  cnpjOrgaoSubrogado?: string;
  nomeOrgaoSubrogado?: string;
  codigoUnidadeOrgao?: string;
  nomeUnidadeOrgao?: string;
  codigoUnidadeOrgaoSubrogado?: string;
  nomeUnidadeOrgaoSubrogado?: string;
}

export type PaginaRetornoAtaRegistroPrecoPeriodoDTO = PaginaRetornoBase<
  AtaRegistroPrecoPeriodoDTO
>;

// Instrumento de Cobrança Types
export interface TipoInstrumentoCobrancaDTO {
  id?: number;
  nome?: string;
  descricao?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  statusAtivo?: boolean;
}

export interface ItemNotaFiscalConsultaDTO {
  numeroItem?: string;
  descricaoProdutoServico?: string;
  codigoNCM?: string;
  descricaoNCM?: string;
  cfop?: string;
  quantidade?: string;
  unidade?: string;
  valorUnitario?: string;
  valorTotal?: string;
}

export interface EventoNotaFiscalConsultaDTO {
  dataEvento?: string;
  tipoEvento?: string;
  evento?: string;
  motivoEvento?: string;
}

export interface NotaFiscalEletronicaConsultaDTO {
  instrumentoCobrancaId?: number;
  chave?: string;
  nfTransparenciaID?: number;
  numero?: number;
  serie?: number;
  dataEmissao?: string;
  niEmitente?: string;
  nomeEmitente?: string;
  nomeMunicipioEmitente?: string;
  codigoOrgaoDestinatario?: string;
  nomeOrgaoDestinatario?: string;
  codigoOrgaoSuperiorDestinatario?: string;
  nomeOrgaoSuperiorDestinatario?: string;
  valorNotaFiscal?: string;
  tipoEventoMaisRecente?: string;
  dataTipoEventoMaisRecente?: string;
  dataInclusao?: string;
  dataAtualizacao?: string;
  itens?: ItemNotaFiscalConsultaDTO[];
  eventos?: EventoNotaFiscalConsultaDTO[];
}

export interface ConsultarInstrumentoCobrancaDTO {
  cnpj?: string;
  ano?: number;
  sequencialContrato?: number;
  sequencialInstrumentoCobranca?: number;
  tipoInstrumentoCobranca?: TipoInstrumentoCobrancaDTO;
  numeroInstrumentoCobranca?: string;
  dataEmissaoDocumento?: string;
  observacao?: string;
  chaveNFe?: string;
  fonteNFe?: number;
  dataConsultaNFe?: string;
  statusResponseNFe?: string;
  jsonResponseNFe?: string;
  notaFiscalEletronica?: NotaFiscalEletronicaConsultaDTO;
  dataInclusao?: string;
  dataAtualizacao?: string;
  recuperarContratoDTO?: RecuperarContratoDTO;
}

export type PaginaRetornoConsultarInstrumentoCobrancaDTO = PaginaRetornoBase<
  ConsultarInstrumentoCobrancaDTO
>;

// Main Client Interface
export interface PNCPClient {
  // Plano de Contratação
  "GET /v1/pca/usuario": {
    response: PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO;
    searchParams: {
      anoPca: number;
      idUsuario: number;
      codigoClassificacaoSuperior?: string;
      cnpj?: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/pca/atualizacao": {
    response: PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO;
    searchParams: {
      dataInicio: string;
      dataFim: string;
      cnpj?: string;
      codigoUnidade?: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/pca/": {
    response: PaginaRetornoPlanoContratacaoComItensDoUsuarioDTO;
    searchParams: {
      anoPca: number;
      codigoClassificacaoSuperior: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  // Contratação
  "GET /v1/orgaos/:cnpj/compras/:ano/:sequencial": {
    response: RecuperarCompraDTO;
  };

  "GET /v1/contratacoes/publicacao": {
    response: PaginaRetornoRecuperarCompraPublicacaoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      codigoModalidadeContratacao: number;
      codigoModoDisputa?: number;
      uf?: string;
      codigoMunicipioIbge?: string;
      cnpj?: string;
      codigoUnidadeAdministrativa?: string;
      idUsuario?: number;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/contratacoes/proposta": {
    response: PaginaRetornoRecuperarCompraPublicacaoDTO;
    searchParams: {
      dataFinal: string;
      codigoModalidadeContratacao?: number;
      uf?: string;
      codigoMunicipioIbge?: string;
      cnpj?: string;
      codigoUnidadeAdministrativa?: string;
      idUsuario?: number;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/contratacoes/atualizacao": {
    response: PaginaRetornoRecuperarCompraPublicacaoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      codigoModalidadeContratacao: number;
      codigoModoDisputa?: number;
      uf?: string;
      codigoMunicipioIbge?: string;
      cnpj?: string;
      codigoUnidadeAdministrativa?: string;
      idUsuario?: number;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  // Contratos
  "GET /v1/contratos": {
    response: PaginaRetornoRecuperarContratoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      cnpjOrgao?: string;
      codigoUnidadeAdministrativa?: string;
      usuarioId?: number;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/contratos/atualizacao": {
    response: PaginaRetornoRecuperarContratoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      cnpjOrgao?: string;
      codigoUnidadeAdministrativa?: string;
      usuarioId?: number;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  // Atas
  "GET /v1/atas": {
    response: PaginaRetornoAtaRegistroPrecoPeriodoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      idUsuario?: number;
      cnpj?: string;
      codigoUnidadeAdministrativa?: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  "GET /v1/atas/atualizacao": {
    response: PaginaRetornoAtaRegistroPrecoPeriodoDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      idUsuario?: number;
      cnpj?: string;
      codigoUnidadeAdministrativa?: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };

  // Instrumentos de Cobrança
  "GET /v1/instrumentoscobranca/inclusao": {
    response: PaginaRetornoConsultarInstrumentoCobrancaDTO;
    searchParams: {
      dataInicial: string;
      dataFinal: string;
      tipoInstrumentoCobranca?: number;
      cnpjOrgao?: string;
      pagina: number;
      tamanhoPagina?: number;
    };
  };
}
