import {
  AdicionarOrigemExpedicaoRequestModel,
  AgrupamentoExpedicaoModel,
  AlterarExpedicaoRequestModel,
  AtualizarContaReceberRequestModel,
  AtualizarContatoContatoModelRequest,
  AtualizarContatoModelRequest,
  AtualizarDespachoRequestModel,
  AtualizarMarcadoresRequestModel,
  AtualizarSituacaoSeparacaoRequestModel,
  AtualizarVariacaoProdutoRequestModel,
  BaixarContaReceberModelRequest,
  CriarAgrupamentoExpedicaoRequestModel,
  CriarAgrupamentoExpedicaoResponseModel,
  CriarContaPagarRequestModel,
  CriarContaPagarResponseModel,
  CriarContaReceberRequestModel,
  CriarContaReceberResponseModel,
  CriarContatoContatoModelRequest,
  CriarContatoContatoModelResponse,
  CriarContatoModelRequest,
  CriarContatoModelResponse,
  CriarMarcadorRequestModel,
  CriarOrdemCompraRequestModel,
  CriarVariacaoProdutoRequestModel,
  EtiquetaExpedicaoModel,
  ExcluirMarcadoresRequestModel,
  ListagemAgrupamentosExpedicaoResponseModel,
  ListagemCategoriasReceitaDespesaResponse,
  ListagemContasPagarResponseModel,
  ListagemContasReceberResponse,
  ListagemContatoModelResponse,
  ListagemContatosContatoModelResponse,
  ListagemCustoProdutoResponseModel,
  ListagemOrdemCompraResponseModel,
  ListagemOrdemServicoResponseModel,
  ListagemSeparacaoResponseModel,
  ListagemVendedoresResponseModel,
  ListarArvoreCategoriasModelResponse,
  ListarTiposDeContatosModelResponse,
  ObterContaPagarModelResponse,
  ObterContaReceberResponseModel,
  ObterContatoContatoModelResponse,
  ObterContatoModelResponse,
  ObterInfoContaModelResponse,
  ObterMarcadorResponseModel,
  OrdemCompraResponseModel,
  OrdemServicoResponseModel,
  SeparacaoModel,
  TagsProdutoResponseModel,
  VariacaoProdutoModel,
} from "./types.ts";

// Define the TinyClient interface with all API endpoints
export interface TinyClient {
  // Categorias
  "GET /categorias/todas": {
    response: ListarArvoreCategoriasModelResponse;
  };

  // Categorias Receita/Despesa
  "GET /categorias-receita-despesa": {
    response: ListagemCategoriasReceitaDespesaResponse;
    searchParams?: {
      descricao?: string;
      grupo?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  // Contas a Pagar
  "GET /contas-pagar": {
    response: ListagemContasPagarResponseModel;
    searchParams?: {
      nomeCliente?: string;
      situacao?: "aberto" | "cancelada" | "pago" | "parcial" | "prevista";
      dataInicialEmissao?: string;
      dataFinalEmissao?: string;
      dataInicialVencimento?: string;
      dataFinalVencimento?: string;
      numeroDocumento?: string;
      numeroBanco?: string;
      marcadores?: string[];
      idContato?: number;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /contas-pagar": {
    response: CriarContaPagarResponseModel;
    body: CriarContaPagarRequestModel;
  };

  "GET /contas-pagar/:idContaPagar": {
    response: ObterContaPagarModelResponse;
  };

  "GET /contas-pagar/:idContaPagar/marcadores": {
    response: ObterMarcadorResponseModel[];
  };

  // Contas a Receber
  "GET /contas-receber/:idContaReceber": {
    response: ObterContaReceberResponseModel;
  };

  "PUT /contas-receber/:idContaReceber": {
    response: void;
    body: AtualizarContaReceberRequestModel;
  };

  "POST /contas-receber/:idContaReceber/baixar": {
    response: void;
    body: BaixarContaReceberModelRequest;
  };

  "GET /contas-receber": {
    response: ListagemContasReceberResponse;
    searchParams?: {
      nomeCliente?: string;
      situacao?: "aberto" | "cancelada" | "pago" | "parcial" | "prevista";
      dataInicialEmissao?: string;
      dataFinalEmissao?: string;
      dataInicialVencimento?: string;
      dataFinalVencimento?: string;
      numeroDocumento?: string;
      numeroBanco?: string;
      idNota?: number;
      idVenda?: number;
      marcadores?: string[];
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /contas-receber": {
    response: CriarContaReceberResponseModel;
    body: CriarContaReceberRequestModel;
  };

  "GET /contas-receber/:idContaReceber/marcadores": {
    response: ObterMarcadorResponseModel[];
  };

  // Contatos
  "GET /contatos/:idContato": {
    response: ObterContatoModelResponse;
  };

  "PUT /contatos/:idContato": {
    response: void;
    body: AtualizarContatoModelRequest;
  };

  "GET /contatos/:idContato/pessoas/:idPessoa": {
    response: ObterContatoContatoModelResponse;
  };

  "PUT /contatos/:idContato/pessoas/:idPessoa": {
    response: void;
    body: AtualizarContatoContatoModelRequest;
  };

  "DELETE /contatos/:idContato/pessoas/:idPessoa": {
    response: void;
  };

  "GET /contatos": {
    response: {
      itens: ListagemContatoModelResponse[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      codigo?: string;
      situacao?: "B" | "A" | "I" | "E";
      idVendedor?: number;
      cpfCnpj?: string;
      celular?: string;
      dataCriacao?: string;
      dataAtualizacao?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /contatos": {
    response: CriarContatoModelResponse;
    body: CriarContatoModelRequest;
  };

  "GET /contatos/:idContato/pessoas": {
    response: {
      itens: ListagemContatosContatoModelResponse[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      limit?: number;
      offset?: number;
    };
  };

  "POST /contatos/:idContato/pessoas": {
    response: CriarContatoContatoModelResponse;
    body: CriarContatoContatoModelRequest;
  };

  "GET /contatos/tipos": {
    response: {
      itens: ListarTiposDeContatosModelResponse[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      limit?: number;
      offset?: number;
    };
  };

  // Company Info
  "GET /info": {
    response: ObterInfoContaModelResponse;
  };

  // Estoque
  "GET /estoque/:idProduto": {
    response: {
      id: number;
      idProduto: number;
      nomeProduto: string;
      quantidade: number;
      localizacao?: string;
      ultimaAtualização: string;
    };
  };

  "POST /estoque/:idProduto": {
    response: {
      id: number;
      idProduto: number;
      nomeProduto: string;
      quantidade: number;
      localizacao?: string;
      ultimaAtualização: string;
    };
    body: {
      quantidade: number;
      localizacao?: string;
      observacao?: string;
    };
  };

  // Produtos
  "GET /produtos/:idProduto": {
    response: {
      id: number;
      codigo?: string;
      nome: string;
      preco: number;
      precoCusto?: number;
      descricao?: string;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo: boolean;
      dataCriacao: string;
      dataAtualizacao?: string;
    };
  };

  "GET /produtos": {
    response: {
      itens: {
        id: number;
        codigo?: string;
        nome: string;
        preco: number;
        precoCusto?: number;
        unidade?: string;
        idCategoria?: number;
        ativo: boolean;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      codigo?: string;
      idCategoria?: number;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /produtos": {
    response: {
      id: number;
      codigo?: string;
      nome: string;
      preco: number;
      precoCusto?: number;
      descricao?: string;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo: boolean;
      dataCriacao: string;
    };
    body: {
      codigo?: string;
      nome: string;
      preco: number;
      precoCusto?: number;
      descricao?: string;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo?: boolean;
    };
  };

  "PUT /produtos/:idProduto/preco": {
    response: {
      id: number;
      preco: number;
      dataAtualizacao: string;
    };
    body: {
      preco: number;
    };
  };

  "PUT /produtos/:idProduto": {
    response: {
      id: number;
      codigo?: string;
      nome: string;
      preco: number;
      precoCusto?: number;
      descricao?: string;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo: boolean;
      dataAtualizacao: string;
    };
    body: {
      codigo?: string;
      nome?: string;
      preco?: number;
      precoCusto?: number;
      descricao?: string;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo?: boolean;
    };
  };

  // Pedidos
  "GET /pedidos": {
    response: {
      itens: {
        id: number;
        numero: string;
        situacao: string;
        data: string;
        valor: number;
        idContato?: number;
        nomeContato?: string;
        cpfCnpj?: string;
        tipoContato: string;
        idVendedor?: number;
        nomeVendedor?: string;
        observacao?: string;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      situacao?: string;
      dataInicial?: string;
      dataFinal?: string;
      idVendedor?: number;
      idContato?: number;
      cpfCnpj?: string;
      numero?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /pedidos/:idPedido": {
    response: {
      id: number;
      numero: string;
      situacao: string;
      data: string;
      dataCriacao: string;
      dataAtualizacao?: string;
      valor: number;
      valorFrete?: number;
      formaPagamento?: string;
      formaEnvio?: string;
      observacao?: string;
      idContato?: number;
      nomeContato?: string;
      cpfCnpj?: string;
      email?: string;
      telefone?: string;
      idVendedor?: number;
      nomeVendedor?: string;
      itens: {
        id: number;
        idProduto: number;
        nomeProduto: string;
        quantidade: number;
        valor: number;
        descontoItem?: number;
        observacao?: string;
      }[];
      enderecoEntrega?: {
        endereco?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cep?: string;
        cidade?: string;
        uf?: string;
      };
    };
  };

  "GET /pedidos/:idPedido/marcadores": {
    response: ObterMarcadorResponseModel[];
  };

  "PUT /pedidos/:idPedido/marcadores": {
    response: void;
    body: AtualizarMarcadoresRequestModel;
  };

  "POST /pedidos/:idPedido/marcadores": {
    response: void;
    body: CriarMarcadorRequestModel;
  };

  "DELETE /pedidos/:idPedido/marcadores": {
    response: void;
    body: ExcluirMarcadoresRequestModel;
  };

  // Formas de Pagamento
  "GET /formas-pagamento": {
    response: {
      itens: {
        id: number;
        nome: string;
        numeroParcelas: number;
        ativo: boolean;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /formas-pagamento/:idFormaPagamento": {
    response: {
      id: number;
      nome: string;
      numeroParcelas: number;
      ativo: boolean;
      dataAtualizacao?: string;
    };
  };

  // Formas de Envio
  "GET /formas-envio": {
    response: {
      itens: {
        id: number;
        nome: string;
        servico?: string;
        ativo: boolean;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /formas-envio/:idFormaEnvio": {
    response: {
      id: number;
      nome: string;
      servico?: string;
      ativo: boolean;
      dataAtualizacao?: string;
    };
  };

  // Intermediadores
  "GET /intermediadores": {
    response: {
      itens: {
        id: number;
        nome: string;
        tipoPessoa: string;
        cpfCnpj?: string;
        dataCriacao: string;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /intermediadores/:idIntermediador": {
    response: {
      id: number;
      nome: string;
      tipoPessoa: string;
      cpfCnpj?: string;
      inscricaoEstadual?: string;
      email?: string;
      telefone?: string;
      endereco?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      cep?: string;
      cidade?: string;
      uf?: string;
      dataCriacao: string;
      dataAtualizacao?: string;
    };
  };

  // Listas de Preços
  "GET /listas-precos": {
    response: {
      itens: {
        id: number;
        nome: string;
        descricao?: string;
        ativo: boolean;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /listas-precos/:idListaDePreco": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      ativo: boolean;
      dataAtualizacao?: string;
    };
  };

  // Marcas
  "GET /marcas": {
    response: {
      itens: {
        id: number;
        nome: string;
        descricao?: string;
        dataCriacao: string;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /marcas": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      dataCriacao: string;
    };
    body: {
      nome: string;
      descricao?: string;
    };
  };

  "PUT /marcas/:idMarca": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      dataAtualizacao: string;
    };
    body: {
      nome?: string;
      descricao?: string;
    };
  };

  // Notas Fiscais
  "GET /notas": {
    response: {
      itens: {
        id: number;
        situacao?: string;
        tipo?: string;
        numero?: string;
        serie?: string;
        chaveAcesso?: string;
        dataEmissao?: string;
        cliente: {
          id: number;
          nome?: string;
          fantasia?: string;
          tipoPessoa?: string;
          cpfCnpj?: string;
          ie?: string;
          rg?: string;
          endereco?: string;
          numero?: string;
          complemento?: string;
          bairro?: string;
          cep?: string;
          cidade?: string;
          uf?: string;
          email?: string;
          fone?: string;
        };
        ecommerce?: {
          numeroPedido?: string;
          codigoPedido?: string;
          nomePlataforma?: string;
        };
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      tipo?: string;
      numero?: number;
      cpfCnpj?: string;
      dataInicial?: string;
      dataFinal?: string;
      situacao?: string;
      numeroPedidoEcommerce?: string;
      idVendedor?: number;
      idFormaEnvio?: number;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /notas/:idNota": {
    response: {
      id: number;
      situacao?: string;
      tipo?: string;
      numero?: string;
      serie?: string;
      chaveAcesso?: string;
      dataEmissao?: string;
      cliente: {
        id: number;
        nome?: string;
        fantasia?: string;
        tipoPessoa?: string;
        cpfCnpj?: string;
        ie?: string;
        rg?: string;
        endereco?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cep?: string;
        cidade?: string;
        uf?: string;
        email?: string;
        fone?: string;
      };
      finalidade?: string;
      regimeTributario?: number;
      dataInclusao?: string;
      numeroPedido?: string;
      itens?: Array<{
        idProduto?: number;
        codigo?: string;
        descricao?: string;
        unidade?: string;
        quantidade?: number;
        valorUnitario?: number;
        valorTotal?: number;
        cfop?: string;
      }>;
      parcelas?: Array<{
        dias?: number;
        data?: string;
        valor?: number;
        observacoes?: string;
        idFormaPagamento?: string;
        idMeioPagamento?: string;
      }>;
      observacoes?: string;
      valorFrete?: number;
      valorOutros?: number;
      valorTotal?: number;
      valorDesconto?: number;
      transportadora?: {
        id?: number;
        nome?: string;
        cpfCnpj?: string;
      };
    };
  };

  "GET /notas/:idNota/link": {
    response: {
      link: string;
    };
  };

  "GET /notas/:idNota/xml": {
    response: {
      xml: string;
    };
  };

  "POST /notas/xml": {
    response: {
      idNota: number;
    };
    body: {
      xml: string;
      numeroPedido?: number;
    };
  };

  "GET /notas/:idNota/marcadores": {
    response: {
      id: number;
      nome: string;
      cor: string;
    }[];
  };

  "PUT /notas/:idNota/marcadores": {
    response: void;
    body: AtualizarMarcadoresRequestModel;
  };

  "POST /notas/:idNota/marcadores": {
    response: void;
    body: {
      nome: string;
      cor: string;
    }[];
  };

  "DELETE /notas/:idNota/marcadores": {
    response: void;
    body: ExcluirMarcadoresRequestModel;
  };

  "POST /notas/:idNota/emitir": {
    response: void;
    body: {
      email?: string;
      gerarDanfe?: boolean;
    };
  };

  "POST /notas/:idNota/lancar-contas": {
    response: void;
  };

  "POST /notas/:idNota/lancar-estoque": {
    response: void;
  };

  // Additional Pedidos endpoints
  "POST /pedidos": {
    response: {
      idPedido: number;
      numero: string;
    };
    body: {
      idContato: number;
      data?: string;
      idFormaPagamento?: number;
      idFormaEnvio?: number;
      idVendedor?: number;
      numeroPedidoExterno?: string;
      observacoes?: string;
      observacoesInternas?: string;
      itens: {
        idProduto: number;
        quantidade: number;
        valor?: number;
        desconto?: number;
      }[];
    };
  };

  "PUT /pedidos/:idPedido": {
    response: void;
    body: {
      numero?: string;
      data?: string;
      idSituacao?: number;
      idFormaPagamento?: number;
      idFormaEnvio?: number;
      numeroPedidoExterno?: string;
      observacoes?: string;
      observacoesInternas?: string;
    };
  };

  "PUT /pedidos/:idPedido/situacao": {
    response: void;
    body: {
      idSituacao: number;
    };
  };

  "POST /pedidos/:idPedido/gerar-nota-fiscal": {
    response: {
      idNota: number;
    };
    body: {
      modelo?: "nfe" | "nfce";
      gerarDanfe?: boolean;
      email?: string;
    };
  };

  "POST /pedidos/:idPedido/lancar-contas": {
    response: void;
  };

  "POST /pedidos/:idPedido/lancar-estoque": {
    response: void;
  };

  "POST /pedidos/:idPedido/estornar-contas": {
    response: void;
  };

  "POST /pedidos/:idPedido/estornar-estoque": {
    response: void;
  };

  // Product kit
  "GET /produtos/:idProduto/kit": {
    response: {
      idProduto: number;
      nome: string;
      quantidade: number;
      valorUnitario: number;
    }[];
  };

  "PUT /produtos/:idProduto/kit": {
    response: void;
    body: {
      itens: {
        idProduto: number;
        quantidade: number;
      }[];
    };
  };

  // Services
  "GET /servicos": {
    response: {
      itens: {
        id: number;
        nome: string;
        descricao?: string;
        valor: number;
        observacoes?: string;
        ativo: boolean;
        dataCriacao: string;
        dataAtualizacao?: string;
      }[];
      paginacao: {
        pagina: number;
        total: number;
        totalPaginas: number;
      };
    };
    searchParams?: {
      nome?: string;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /servicos/:idServico": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      valor: number;
      observacoes?: string;
      ativo: boolean;
      dataCriacao: string;
      dataAtualizacao?: string;
    };
  };

  "POST /servicos": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      valor: number;
      observacoes?: string;
      ativo: boolean;
      dataCriacao: string;
    };
    body: {
      nome: string;
      descricao?: string;
      valor: number;
      observacoes?: string;
      ativo?: boolean;
    };
  };

  "PUT /servicos/:idServico": {
    response: {
      id: number;
      nome: string;
      descricao?: string;
      valor: number;
      observacoes?: string;
      ativo: boolean;
      dataAtualizacao: string;
    };
    body: {
      nome?: string;
      descricao?: string;
      valor?: number;
      observacoes?: string;
      ativo?: boolean;
    };
  };

  "POST /servicos/:idServico/transformar-produto": {
    response: {
      idProduto: number;
    };
    body: {
      codigo?: string;
      descricao?: string;
      precoCusto?: number;
      unidade?: string;
      peso?: number;
      gtin?: string;
      idMarca?: number;
      idCategoria?: number;
      ativo?: boolean;
    };
  };

  // Expedição (Expedition)
  "POST /expedicao/:idAgrupamento/origens": {
    response: void;
    body: AdicionarOrigemExpedicaoRequestModel;
  };

  "PUT /expedicao/:idAgrupamento/expedicao/:idExpedicao": {
    response: void;
    body: AlterarExpedicaoRequestModel;
  };

  "POST /expedicao/:idAgrupamento/concluir": {
    response: void;
  };

  "GET /expedicao": {
    response: ListagemAgrupamentosExpedicaoResponseModel;
    searchParams?: {
      nome?: string;
      situacao?: string;
      dataInicial?: string;
      dataFinal?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "POST /expedicao": {
    response: CriarAgrupamentoExpedicaoResponseModel;
    body: CriarAgrupamentoExpedicaoRequestModel;
  };

  "GET /expedicao/:idAgrupamento": {
    response: AgrupamentoExpedicaoModel;
  };

  "GET /expedicao/:idAgrupamento/etiquetas": {
    response: EtiquetaExpedicaoModel[];
  };

  "GET /expedicao/:idAgrupamento/expedicao/:idExpedicao/etiquetas": {
    response: EtiquetaExpedicaoModel[];
  };

  // Ordem de Serviço (Service Orders)
  "GET /ordem-servico": {
    response: ListagemOrdemServicoResponseModel;
    searchParams?: {
      nome?: string;
      situacao?: string;
      dataInicial?: string;
      dataFinal?: string;
      idCliente?: number;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /ordem-servico/:idOrdemServico": {
    response: OrdemServicoResponseModel;
  };

  "PUT /ordem-servico/:idOrdemServico": {
    response: void;
    body: {
      nome?: string;
      situacao?: string;
      idCliente?: number;
      observacao?: string;
      itens?: Array<{
        id?: number;
        tipo: "produto" | "servico";
        idItem: number;
        quantidade: number;
        valorUnitario?: number;
      }>;
    };
  };

  "PUT /ordem-servico/:idOrdemServico/situacao": {
    response: void;
    body: {
      situacao: string;
    };
  };

  "POST /ordem-servico": {
    response: {
      id: number;
      numero: string;
      nome: string;
      situacao: string;
      dataCriacao: string;
    };
    body: {
      nome: string;
      idCliente?: number;
      observacao?: string;
      itens?: Array<{
        tipo: "produto" | "servico";
        idItem: number;
        quantidade: number;
        valorUnitario?: number;
      }>;
    };
  };

  "POST /ordem-servico/:idOrdemServico/gerar-nota-fiscal": {
    response: {
      idNota: number;
    };
    body: {
      modelo?: "nfe" | "nfce";
      gerarDanfe?: boolean;
      email?: string;
    };
  };

  "POST /ordem-servico/:idOrdemServico/lancar-contas": {
    response: void;
  };

  "POST /ordem-servico/:idOrdemServico/lancar-estoque": {
    response: void;
  };

  // Ordem de Compra (Purchase Orders)
  "GET /ordem-compra": {
    response: ListagemOrdemCompraResponseModel;
    searchParams?: {
      situacao?: string;
      dataInicial?: string;
      dataFinal?: string;
      idFornecedor?: number;
      cpfCnpj?: string;
      numero?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /ordem-compra/:idOrdemCompra": {
    response: OrdemCompraResponseModel;
  };

  "PUT /ordem-compra/:idOrdemCompra": {
    response: void;
    body: {
      numero?: string;
      data?: string;
      situacao?: string;
      observacao?: string;
    };
  };

  "PUT /ordem-compra/:idOrdemCompra/situacao": {
    response: void;
    body: {
      situacao: string;
    };
  };

  "POST /ordem-compra": {
    response: {
      id: number;
      numero: string;
    };
    body: CriarOrdemCompraRequestModel;
  };

  "POST /ordem-compra/:idOrdemCompra/lancar-contas": {
    response: void;
  };

  "POST /ordem-compra/:idOrdemCompra/lancar-estoque": {
    response: void;
  };

  // Vendedores (Vendors)
  "GET /vendedores": {
    response: ListagemVendedoresResponseModel;
    searchParams?: {
      nome?: string;
      email?: string;
      ativo?: boolean;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  // Add more endpoints here following the same pattern
  // This is a partial implementation covering the first few endpoints from the README.md

  // Add to the pedidos section or near it
  "PUT /pedidos/:idPedido/despacho": {
    response: void;
    body: AtualizarDespachoRequestModel;
  };

  // Add these endpoints to the products section
  "PUT /produtos/:idProduto/variacoes/:idVariacao": {
    response: VariacaoProdutoModel;
    body: AtualizarVariacaoProdutoRequestModel;
  };

  "DELETE /produtos/:idProduto/variacoes/:idVariacao": {
    response: void;
  };

  "POST /produtos/:idProduto/variacoes": {
    response: VariacaoProdutoModel;
    body: CriarVariacaoProdutoRequestModel;
  };

  // Add these endpoints to the products section
  "GET /produtos/:idProduto/custos": {
    response: ListagemCustoProdutoResponseModel;
    searchParams?: {
      dataInicial?: string;
      dataFinal?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /produtos/:idProduto/tags": {
    response: TagsProdutoResponseModel;
  };

  // Separação (Separation)
  "PUT /separacao/:idSeparacao/situacao": {
    response: void;
    body: AtualizarSituacaoSeparacaoRequestModel;
  };

  "GET /separacao": {
    response: ListagemSeparacaoResponseModel;
    searchParams?: {
      numero?: string;
      situacao?: string;
      dataInicial?: string;
      dataFinal?: string;
      idVendedor?: number;
      idCliente?: number;
      cpfCnpj?: string;
      orderBy?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };
  };

  "GET /separacao/:idSeparacao": {
    response: SeparacaoModel;
  };
}
