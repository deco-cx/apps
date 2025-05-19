// Basic types used throughout the Tiny ERP API

// Common response for paginated results
export interface PaginatedResultModel {
  pagina: number;
  total: number;
  totalPaginas: number;
}

// Error response model
export interface ErrorDTO {
  message: string;
  errors?: Record<string, string[]>;
}

// Categoria types
export interface CategoriaModel {
  id: number;
  descricao: string;
  idCategoriaPai?: number;
  filhos?: CategoriaModel[];
}

export interface ListarArvoreCategoriasModelResponse {
  categorias: CategoriaModel[];
}

// Categorias Receita/Despesa
export interface ListagemCategoriasReceitaDespesaResponseModel {
  id: number;
  descricao: string;
  grupo: string;
}

export interface ListagemCategoriasReceitaDespesaResponse {
  itens: ListagemCategoriasReceitaDespesaResponseModel[];
  paginacao: PaginatedResultModel;
}

// Contas a Pagar
export interface ContaPagarModel {
  id: number;
  idContato?: number;
  nomeContato?: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  situacao: string;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface ListagemContasPagarResponseModel {
  itens: ContaPagarModel[];
  paginacao: PaginatedResultModel;
}

export interface CriarContaPagarRequestModel {
  idContato?: number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface CriarContaPagarResponseModel {
  id: number;
  idContato?: number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface ObterContaPagarModelResponse {
  id: number;
  idContato?: number;
  nomeContato?: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  situacao: string;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

// Marcadores
export interface ObterMarcadorResponseModel {
  id: number;
  descricao: string;
  cor: string;
}

export interface CriarMarcadorRequestModel {
  nome: string;
  cor: string;
}

export interface AtualizarMarcadoresRequestModel {
  marcadores: {
    id: number;
    nome?: string;
    cor?: string;
  }[];
}

export interface ExcluirMarcadoresRequestModel {
  ids: number[];
}

// Contas a Receber
export interface ContaReceberModel {
  id: number;
  idContato?: number;
  nomeContato?: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  situacao: string;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface ListagemContasReceberResponseModel {
  id: number;
  idContato?: number;
  nomeContato?: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  situacao: string;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface ListagemContasReceberResponse {
  itens: ListagemContasReceberResponseModel[];
  paginacao: PaginatedResultModel;
}

export interface CriarContaReceberRequestModel {
  idContato?: number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface CriarContaReceberResponseModel {
  id: number;
  idContato?: number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface ObterContaReceberResponseModel {
  id: number;
  idContato?: number;
  nomeContato?: string;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  situacao: string;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface AtualizarContaReceberRequestModel {
  idContato?: number;
  dataEmissao?: string;
  dataVencimento?: string;
  valor?: number;
  formaPagamento?: string;
  numeroBanco?: string;
  numeroDocumento?: string;
  observacao?: string;
}

export interface BaixarContaReceberModelRequest {
  dataPagamento: string;
  valorPago: number;
  observacao?: string;
}

// Contatos
export interface ObterContatoModelResponse {
  id: number;
  codigo?: string;
  nome: string;
  fantasia?: string;
  tipo: string;
  classificacao?: string;
  situacao: string;
  cpfCnpj?: string;
  rgIe?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  fax?: string;
  contatos?: string;
  idVendedor?: number;
  nomeVendedor?: string;
  idListaPreco?: number;
  nomeListaPreco?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface AtualizarContatoModelRequest {
  codigo?: string;
  nome?: string;
  fantasia?: string;
  tipo?: string;
  classificacao?: string;
  situacao?: string;
  cpfCnpj?: string;
  rgIe?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  fax?: string;
  contatos?: string;
  idVendedor?: number;
  idListaPreco?: number;
}

export interface ObterContatoContatoModelResponse {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  departamento?: string;
  cargo?: string;
  observacao?: string;
}

export interface AtualizarContatoContatoModelRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  departamento?: string;
  cargo?: string;
  observacao?: string;
}

export interface CriarContatoContatoModelRequest {
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  departamento?: string;
  cargo?: string;
  observacao?: string;
}

export interface CriarContatoContatoModelResponse {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  departamento?: string;
  cargo?: string;
  observacao?: string;
}

export interface ListagemContatoModelResponse {
  id: number;
  codigo?: string;
  nome: string;
  fantasia?: string;
  tipo: string;
  classificacao?: string;
  situacao: string;
  cpfCnpj?: string;
  rgIe?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  fax?: string;
  contatos?: string;
  idVendedor?: number;
  nomeVendedor?: string;
  idListaPreco?: number;
  nomeListaPreco?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CriarContatoModelRequest {
  nome: string;
  codigo?: string;
  fantasia?: string;
  /**
   * @description Allowed values: J (Pessoa Jurídica), F (Pessoa Física), E (Estrangeiro), X (Estrangeiro no Brasil)
   */
  tipoPessoa?: string;
  cpfCnpj?: string;
  inscricaoEstadual?: string;
  rg?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    cep: string;
    uf: string;
    pais?: string;
  };
  enderecoCobranca?: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    cep: string;
    uf: string;
    pais?: string;
  };
  inscricaoMunicipal?: string;
  telefoneAdicional?: string;
  emailNfe?: string;
  site?: string;
  regimeTributario?: number;
  estadoCivil?: number;
  profissao?: string;
  sexo?: string;
  dataNascimento?: string;
  naturalidade?: string;
  nomePai?: string;
  nomeMae?: string;
  cpfPai?: string;
  cpfMae?: string;
  limiteCredito?: number;
  situacao?: string;
  observacoes?: string;
  vendedor?: {
    id: number;
  };
  tipos?: number[];
  contatos?: Array<{
    nome: string;
    telefone?: string;
    ramal?: string;
    email?: string;
    setor?: string;
  }>;
}

export interface CriarContatoModelResponse {
  id: number;
  nome: string;
  codigo?: string;
  fantasia?: string;
  tipoPessoa?: string;
  cpfCnpj?: string;
  inscricaoEstadual?: string;
  rg?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    cep: string;
    uf: string;
    pais?: string;
  };
  enderecoCobranca?: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    municipio: string;
    cep: string;
    uf: string;
    pais?: string;
  };
  inscricaoMunicipal?: string;
  telefoneAdicional?: string;
  emailNfe?: string;
  site?: string;
  regimeTributario?: number;
  estadoCivil?: number;
  profissao?: string;
  sexo?: string;
  dataNascimento?: string;
  naturalidade?: string;
  nomePai?: string;
  nomeMae?: string;
  cpfPai?: string;
  cpfMae?: string;
  limiteCredito?: number;
  situacao: string;
  observacoes?: string;
  vendedor?: {
    id: number;
  };
  tipos?: number[];
  contatos?: Array<{
    nome: string;
    telefone?: string;
    ramal?: string;
    email?: string;
    setor?: string;
  }>;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface ListagemContatosContatoModelResponse {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  departamento?: string;
  cargo?: string;
  observacao?: string;
}

export interface ListarTiposDeContatosModelResponse {
  id: number;
  nome: string;
}

// Company Info
export interface ObterInfoContaModelResponse {
  nome: string;
  fantasia?: string;
  email?: string;
  telefone?: string;
  cpfCnpj: string;
  rgIe?: string;
  endereco?: string;
  complemento?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  plano?: string;
}

// Expedição (Expedition) types
export interface ExpedicaoOrigemModel {
  id: number;
  tipo: "pedido" | "nota";
  identificador: number;
  numero: string;
}

export interface AdicionarOrigemExpedicaoRequestModel {
  origens: ExpedicaoOrigemModel[];
}

export interface ExpedicaoModel {
  id: number;
  idAgrupamento: number;
  nome: string;
  descricao?: string;
  situacao: string;
  quantidadeObjetos: number;
  idFormaEnvio?: number;
  nomeFormaEnvio?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface AlterarExpedicaoRequestModel {
  nome?: string;
  descricao?: string;
  idFormaEnvio?: number;
}

export interface AgrupamentoExpedicaoModel {
  id: number;
  nome: string;
  descricao?: string;
  quantidadeObjetos: number;
  situacao: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  expedicoes: ExpedicaoModel[];
}

export interface CriarAgrupamentoExpedicaoRequestModel {
  nome: string;
  descricao?: string;
}

export interface CriarAgrupamentoExpedicaoResponseModel {
  id: number;
  nome: string;
  descricao?: string;
  quantidadeObjetos: number;
  situacao: string;
  dataCriacao: string;
}

export interface ListagemAgrupamentosExpedicaoResponseModel {
  itens: AgrupamentoExpedicaoModel[];
  paginacao: PaginatedResultModel;
}

export interface EtiquetaExpedicaoModel {
  id: number;
  idExpedicao: number;
  url: string;
}

// Ordem de Serviço
export interface OrdemServicoModel {
  id: number;
  numero: string;
  nome: string;
  situacao: string;
  idCliente?: number;
  nomeCliente?: string;
  valorServicos: number;
  valorProdutos: number;
  valorTotal: number;
  dataCriacao: string;
  dataAtualizacao?: string;
  observacao?: string;
}

export interface ListagemOrdemServicoResponseModel {
  itens: OrdemServicoModel[];
  paginacao: PaginatedResultModel;
}

export interface OrdemServicoResponseModel {
  id: number;
  numero: string;
  nome: string;
  situacao: string;
  idCliente?: number;
  nomeCliente?: string;
  valorServicos: number;
  valorProdutos: number;
  valorTotal: number;
  dataCriacao: string;
  dataAtualizacao?: string;
  observacao?: string;
  // Additional fields for detailed response
  itens?: Array<{
    id: number;
    tipo: "produto" | "servico";
    idItem: number;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

// Ordem de Compra
export interface OrdemCompraModel {
  id: number;
  numero: string;
  situacao: string;
  data: string;
  valorTotal: number;
  idFornecedor?: number;
  nomeFornecedor?: string;
  cpfCnpj?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  observacao?: string;
}

export interface ListagemOrdemCompraResponseModel {
  itens: OrdemCompraModel[];
  paginacao: PaginatedResultModel;
}

export interface OrdemCompraResponseModel {
  id: number;
  numero: string;
  situacao: string;
  data: string;
  valorTotal: number;
  idFornecedor?: number;
  nomeFornecedor?: string;
  cpfCnpj?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
  observacao?: string;
  itens?: Array<{
    id: number;
    idProduto: number;
    nomeProduto: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
  }>;
}

export interface CriarOrdemCompraRequestModel {
  idFornecedor: number;
  data?: string;
  situacao?: string;
  observacao?: string;
  itens: Array<{
    idProduto: number;
    quantidade: number;
    valorUnitario: number;
  }>;
}

// Vendedores
export interface VendedorModel {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celular?: string;
  observacao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface ListagemVendedoresResponseModel {
  itens: VendedorModel[];
  paginacao: PaginatedResultModel;
}

// Despacho (Dispatch)
export interface AtualizarDespachoRequestModel {
  codigoRastreamento?: string;
  urlRastreamento?: string;
  dataPrevisaoEntrega?: string;
  observacoes?: string;
}

// Variações de Produto
export interface VariacaoProdutoModel {
  id: number;
  idProduto: number;
  nome: string;
  codigo?: string;
  preco: number;
  precoCusto?: number;
  gtin?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface CriarVariacaoProdutoRequestModel {
  nome: string;
  codigo?: string;
  preco: number;
  precoCusto?: number;
  gtin?: string;
}

export interface AtualizarVariacaoProdutoRequestModel {
  nome?: string;
  codigo?: string;
  preco?: number;
  precoCusto?: number;
  gtin?: string;
}

// Custos de Produto
export interface CustoProdutoModel {
  id: number;
  idProduto: number;
  valor: number;
  dataInclusao: string;
}

export interface ListagemCustoProdutoResponseModel {
  itens: CustoProdutoModel[];
  paginacao: PaginatedResultModel;
}

// Tags de Produto
export interface TagProdutoModel {
  id: number;
  nome: string;
}

export interface TagsProdutoResponseModel {
  tags: TagProdutoModel[];
}

// Separação
export interface SeparacaoModel {
  id: number;
  numero: string;
  data: string;
  situacao: string;
  tipoPedido: string;
  idVendedor?: number;
  nomeVendedor?: string;
  idCliente?: number;
  nomeCliente?: string;
  cpfCnpj?: string;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface ListagemSeparacaoResponseModel {
  itens: SeparacaoModel[];
  paginacao: PaginatedResultModel;
}

export interface AtualizarSituacaoSeparacaoRequestModel {
  situacao: string;
}

// This is just a partial set of types. In a real implementation, all types from the OpenAPI spec would be defined.
// The types above cover the first several endpoints in the README.md
