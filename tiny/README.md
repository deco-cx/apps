# Tiny ERP

This app integrates with the Tiny ERP API to manage various business operations.

API specification is in tiny-api-v3.json

## Implementation Progress

The Tiny ERP app implementation is in progress. The following areas have been implemented:

1. **Core Structure:**
   - `types.ts`: Contains TypeScript interfaces for API requests and responses (partially implemented)
   - `client.ts`: Defines the TinyClient interface for HTTP requests (partially implemented)
   - `mod.ts`: Exports the App function and defines the state and props
   - `manifest.gen.ts`: Placeholder for generated manifest

2. **Implemented Functionality:**
   - Categorias (Categories) - Listing and retrieval
   - Formas de Pagamento (Payment Methods) - Listing and retrieval
   - Contas a Pagar/Receber (Payables/Receivables) - Creating, updating, listing 
   - Notas Fiscais (Tax Notes) - Listing, retrieval, issuing, handling XML, inventory management
   - Pedidos (Orders) - Creating, updating, listing, status management, markers
   - Produtos (Products) - Listing, retrieval, updating prices
   - Expedição (Expedition) - Listing, creating, updating expedition groups and shipments
   - And more...

3. **Next Steps:**
   - All API endpoints have been implemented
   - Add proper types in client.ts for all the endpoints
   - Generate the manifest file

## Implementation Status

Below is the table with all API methods and their implementation status.

| Método HTTP | Path                                      | Descrição                                                                                                  | Loader/Action Path |
|-------------|--------------------------------------------|-----------------------------------------------------------------------------------------------------------|---------------------|
| GET         | /categorias/todas                        | Listar a árvore de categorias.                                                                            | loaders/categorias/todas.ts |
| GET         | /categorias-receita-despesa             | Listar categorias de receita e despesa com filtros e paginação.                                           | loaders/categorias-receita-despesa.ts |
| GET         | /contas-pagar                            | Listar contas a pagar com filtros e paginação.                                                             | loaders/contas-pagar/listar.ts |
| POST        | /contas-pagar                            | Criar uma nova conta a pagar.                                                                              | actions/contas-pagar/criar.ts |
| GET         | /contas-pagar/{idContaPagar}             | Obter detalhes de uma conta a pagar específica.                                                                | loaders/contas-pagar/obter.ts |
| GET         | /contas-pagar/{idContaPagar}/marcadores  | Obter os marcadores associados a uma conta a pagar específica.                                                     | loaders/contas-pagar/marcadores.ts |
| GET         | /contas-receber/{idContaReceber}          | Obter detalhes de uma conta a receber específica.                                                             | loaders/contas-receber/obter.ts |
| PUT         | /contas-receber/{idContaReceber}          | Atualizar uma conta a receber específica.                                                                    | actions/contas-receber/atualizar.ts |
| POST        | /contas-receber/{idContaReceber}/baixar    | Baixar (marcar como paga) uma conta a receber específica.                                                          | actions/contas-receber/baixar.ts |
| GET         | /contas-receber                          | Listar contas a receber com filtros e paginação.                                                             | loaders/contas-receber/listar.ts |
| POST        | /contas-receber                          | Criar uma nova conta a receber.                                                                              | actions/contas-receber/criar.ts |
| GET         | /contas-receber/{idContaReceber}/marcadores | Obter os marcadores associados a uma conta a receber específica.                                                   | loaders/contas-receber/marcadores.ts |
| GET         | /contatos/{idContato}                    | Obter detalhes de um contato específico.                                                                     | loaders/contatos/obter.ts |
| PUT         | /contatos/{idContato}                    | Atualizar um contato específico.                                                                             | actions/contatos/atualizar.ts |
| GET         | /contatos/{idContato}/pessoas/{idPessoa} | Obter detalhes de uma pessoa associada a um contato específico.                                                | loaders/contatos/pessoas/obter.ts |
| PUT         | /contatos/{idContato}/pessoas/{idPessoa} | Atualizar os dados de uma pessoa associada a um contato.                                                        | actions/contatos/pessoas/atualizar.ts |
| DELETE      | /contatos/{idContato}/pessoas/{idPessoa} | Excluir uma pessoa de um contato.                                                                           | actions/contatos/pessoas/excluir.ts |
| GET         | /contatos                                | Listar contatos com filtros e paginação.                                                                     | loaders/contatos/listar.ts |
| POST        | /contatos                                | Criar um novo contato.                                                                                         | actions/contatos/criar.ts |
| GET         | /contatos/{idContato}/pessoas             | Listar pessoas associadas a um contato específico com paginação.                                                 | loaders/contatos/pessoas/listar.ts |
| POST        | /contatos/{idContato}/pessoas             | Adicionar uma pessoa a um contato específico.                                                                | actions/contatos/pessoas/criar.ts |
| GET         | /contatos/tipos                          | Listar tipos de contatos com filtros e paginação.                                                              | loaders/contatos/tipos.ts |
| GET         | /info                                   | Obter informações da conta da empresa.                                                                       | loaders/info.ts |
| GET         | /estoque/{idProduto}                     | Obter informações de estoque para um produto específico.                                                           | loaders/estoque/obter.ts |
| POST        | /estoque/{idProduto}                     | Atualizar o estoque de um produto específico.                                                                 | actions/estoque/atualizar.ts |
| POST        | /expedicao/{idAgrupamento}/origens          | Adicionar origens (pedidos ou notas fiscais) a um agrupamento de expedição.                                      | actions/expedicao/adicionar-origens.ts     |
| PUT         | /expedicao/{idAgrupamento}/expedicao/{idExpedicao} | Alterar a expedição de um agrupamento.                                                                  | actions/expedicao/alterar-expedicao.ts     |
| POST        | /expedicao/{idAgrupamento}/concluir         | Concluir um agrupamento de expedição.                                                                    | actions/expedicao/concluir.ts     |
| GET         | /expedicao                                | Listar agrupamentos de expedição com filtros e paginação.                                                      | loaders/expedicao/listar.ts     |
| POST        | /expedicao                                | Criar um novo agrupamento de expedição.                                                                     | actions/expedicao/criar.ts     |
| GET         | /expedicao/{idAgrupamento}                 | Obter detalhes de um agrupamento de expedição específico.                                                          | loaders/expedicao/obter.ts     |
| GET         | /expedicao/{idAgrupamento}/etiquetas     | Obter etiquetas para todos os objetos em um agrupamento de expedição.                                               | loaders/expedicao/etiquetas.ts     |
| GET         | /expedicao/{idAgrupamento}/expedicao/{idExpedicao}/etiquetas | Obter etiquetas para uma expedição específica dentro de um agrupamento.                                       | loaders/expedicao/expedicao-etiquetas.ts     |
| GET         | /formas-envio                            | Listar formas de envio com filtros e paginação.                                                                | loaders/formas-envio/listar.ts |
| GET         | /formas-envio/{idFormaEnvio}            | Obter detalhes de uma forma de envio específica.                                                               | loaders/formas-envio/obter.ts |
| GET         | /formas-pagamento                        | Listar formas de pagamento com filtros e paginação.                                                            | loaders/formas-pagamento/listar.ts |
| GET         | /formas-pagamento/{idFormaPagamento}    | Obter detalhes de uma forma de pagamento específica.                                                            | loaders/formas-pagamento/obter.ts |
| GET         | /intermediadores                         | Listar intermediadores com filtros e paginação.                                                                | loaders/intermediadores/listar.ts |
| GET         | /intermediadores/{idIntermediador}       | Obter detalhes de um intermediador específico.                                                                | loaders/intermediadores/obter.ts |
| GET         | /listas-precos                           | Listar listas de preços com filtros e paginação.                                                                | loaders/listas-precos/listar.ts |
| GET         | /listas-precos/{idListaDePreco}         | Obter detalhes de uma lista de preços específica.                                                               | loaders/listas-precos/obter.ts |
| PUT         | /marcas/{idMarca}                         | Atualizar uma marca específica.                                                                                  | actions/marcas/atualizar.ts |
| GET         | /marcas                                  | Listar marcas com filtros e paginação.                                                                           | loaders/marcas/listar.ts |
| POST        | /marcas                                  | Criar uma nova marca.                                                                                            | actions/marcas/criar.ts |
| GET         | /notas/{idNota}/marcadores  | Obter os marcadores associados a uma conta a pagar específica.                                                     | loaders/notas/marcadores.ts |
| PUT         | /notas/{idNota}/marcadores              | Atualiza os marcadores de uma nota fiscal especifica.                                                              | actions/notas/atualizar-marcadores.ts     |
| POST        | /notas/{idNota}/marcadores              | Criar um marcador em uma nota fiscal especifica.                                                              | actions/notas/criar-marcador.ts     |
| DELETE        | /notas/{idNota}/marcadores              | Excluir marcadores de uma nota fiscal especifica.                                                              | actions/notas/excluir-marcadores.ts     |
| POST        | /notas/{idNota}/emitir                    | Emitir/autorizar uma nota fiscal.                                                                                | actions/notas/emitir.ts     |
| POST        | /notas/xml                               | Incluir uma nota fiscal a partir de um arquivo XML.                                                              | actions/notas/incluir-xml.ts     |
| POST        | /notas/{idNota}/lancar-contas           | Lançar as contas a pagar/receber de uma nota fiscal.                                                              | actions/notas/lancar-contas.ts     |
| POST        | /notas/{idNota}/lancar-estoque          | Lançar o estoque de uma nota fiscal.                                                                             | actions/notas/lancar-estoque.ts     |
| GET         | /notas                                   | Listar notas fiscais com filtros e paginação.                                                                    | loaders/notas/listar.ts     |
| GET         | /notas/{idNota}/link                    | Obter um link para acesso à DANFE de uma nota fiscal.                                                            | loaders/notas/link.ts     |
| GET         | /notas/{idNota}                        | Obter detalhes de uma nota fiscal específica.                                                                  | loaders/notas/obter.ts     |
| GET         | /notas/{idNota}/xml                     | Obter o XML de uma nota fiscal.                                                                                 | loaders/notas/xml.ts     |
| GET         | /ordem-compra/{idOrdemCompra}           | Obter detalhes de uma ordem de compra específica.                                                              | loaders/ordem-compra/obter.ts     |
| PUT         | /ordem-compra/{idOrdemCompra}           | Atualizar uma ordem de compra específica.                                                                      | actions/ordem-compra/atualizar.ts     |
| PUT         | /ordem-compra/{idOrdemCompra}/situacao  | Atualizar a situação de uma ordem de compra específica.                                                           | actions/ordem-compra/atualizar-situacao.ts     |
| GET         | /ordem-compra                           | Listar ordens de compra com filtros e paginação.                                                                | loaders/ordem-compra/listar.ts     |
| POST        | /ordem-compra                           | Criar uma nova ordem de compra.                                                                                  | actions/ordem-compra/criar.ts     |
| POST        | /ordem-compra/{idOrdemCompra}/lancar-contas | Lançar as contas a pagar de uma ordem de compra.                                                                | actions/ordem-compra/lancar-contas.ts     |
| POST        | /ordem-compra/{idOrdemCompra}/lancar-estoque | Lançar o estoque de uma ordem de compra.                                                                     | actions/ordem-compra/lancar-estoque.ts     |
| GET         | /ordem-servico/{idOrdemServico}         | Obter detalhes de uma ordem de serviço específica.                                                              | loaders/ordem-servico/obter.ts     |
| PUT         | /ordem-servico/{idOrdemServico}         | Atualizar uma ordem de serviço específica.                                                                     | actions/ordem-servico/atualizar.ts     |
| PUT         | /ordem-servico/{idOrdemServico}/situacao | Atualizar a situação de uma ordem de serviço específica.                                                          | actions/ordem-servico/atualizar-situacao.ts     |
| GET         | /ordem-servico                          | Listar ordens de serviço com filtros e paginação.                                                               | loaders/ordem-servico/listar.ts     |
| POST        | /ordem-servico                          | Criar uma nova ordem de serviço.                                                                                 | actions/ordem-servico/criar.ts     |
| POST        | /ordem-servico/{idOrdemServico}/gerar-nota-fiscal | Gerar uma nota fiscal a partir de uma ordem de serviço.                                                          | actions/ordem-servico/gerar-nota-fiscal.ts     |
| POST        | /ordem-servico/{idOrdemServico}/lancar-contas | Lançar as contas a receber de uma ordem de serviço.                                                                | actions/ordem-servico/lancar-contas.ts     |
| POST        | /ordem-servico/{idOrdemServico}/lancar-estoque | Lançar o estoque de uma ordem de serviço.                                                                     | actions/ordem-servico/lancar-estoque.ts     |
| PUT         | /pedidos/{idPedido}/despacho             | Atualizar informações de despacho (rastreamento) de um pedido.                                                   | actions/pedidos/atualizar-despacho.ts     |
| GET         | /pedidos/{idPedido}/marcadores         | Obter os marcadores de um pedido especifica.                                                              | loaders/pedidos/marcadores/listar.ts     |
| PUT         | /pedidos/{idPedido}/marcadores         | Atualiza os marcadores de um pedido especifica.                                                              | actions/pedidos/marcadores/atualizar.ts     |
| POST        | /pedidos/{idPedido}/marcadores         | Criar um marcador em um pedido especifica.                                                              | actions/pedidos/marcadores/criar.ts     |
| DELETE        | /pedidos/{idPedido}/marcadores         | Excluir marcadores de um pedido especifica.                                                              | actions/pedidos/marcadores/excluir.ts     |
| GET         | /pedidos/{idPedido}                     | Obter detalhes de um pedido específico.                                                                        | loaders/pedidos/obter.ts |
| PUT         | /pedidos/{idPedido}                     | Atualizar um pedido específico.                                                                                 | actions/pedidos/atualizar.ts     |
| PUT         | /pedidos/{idPedido}/situacao             | Atualizar a situação de um pedido específico.                                                                  | actions/pedidos/atualizar-situacao.ts     |
| GET         | /pedidos                                | Listar pedidos com filtros e paginação.                                                                           | loaders/pedidos/listar.ts |
| POST        | /pedidos                                | Criar um novo pedido.                                                                                            | actions/pedidos/criar.ts     |
| POST        | /pedidos/{idPedido}/estornar-contas      | Estornar as contas a pagar/receber de um pedido.                                                                | actions/pedidos/estornar-contas.ts     |
| POST        | /pedidos/{idPedido}/estornar-estoque     | Estornar o estoque de um pedido.                                                                               | actions/pedidos/estornar-estoque.ts     |
| POST        | /pedidos/{idPedido}/gerar-nota-fiscal    | Gerar uma nota fiscal a partir de um pedido.                                                                     | actions/pedidos/gerar-nota-fiscal.ts     |
| POST        | /pedidos/{idPedido}/lancar-contas        | Lançar as contas a pagar/receber de um pedido.                                                                | actions/pedidos/lancar-contas.ts     |
| POST        | /pedidos/{idPedido}/lancar-estoque       | Lançar o estoque de um pedido.                                                                                  | actions/pedidos/lancar-estoque.ts     |
| PUT         | /produtos/{idProduto}/preco             | Atualizar o preço de um produto específico.                                                                      | actions/produtos/preco/atualizar.ts |
| GET         | /produtos/{idProduto}                     | Obter detalhes de um produto específico.                                                                       | loaders/produtos/obter.ts |
| PUT         | /produtos/{idProduto}                     | Atualizar um produto específico.                                                                                | actions/produtos/atualizar.ts |
| GET         | /produtos/{idProduto}/fabricado             | Obter os produtos usados na produção de um produto especifico.                                                 | Not Implemented     |
| GET         | /produtos/{idProduto}/kit                 | Obter a lista de produtos do kit de um produto especifico.                                                 | loaders/produtos/kit.ts     |
| PUT         | /produtos/{idProduto}/kit                 | Atualizar a lista de produtos do kit de um produto especifico.                                                 | actions/produtos/atualizar-kit.ts     |
| PUT         | /produtos/{idProduto}/variacoes/{idVariacao} | Atualizar uma variação de produto específica.                                                               | actions/produtos/variacoes/atualizar.ts     |
| DELETE      | /produtos/{idProduto}/variacoes/{idVariacao} | Remover uma variação de produto específica.                                                               | actions/produtos/variacoes/excluir.ts     |
| POST        | /produtos/{idProduto}/variacoes         | Criar uma variação para um produto específico.                                                                 | actions/produtos/variacoes/criar.ts     |
| GET         | /produtos                                | Listar produtos com filtros e paginação.                                                                          | loaders/produtos/listar.ts |
| POST        | /produtos                                | Criar um novo produto.                                                                                           | actions/produtos/criar.ts |
| GET         | /produtos/{idProduto}/custos             | Listar custos de um produto especifica, permite filtros por data de início e final                                                                 | loaders/produtos/custos.ts     |
| GET         | /produtos/{idProduto}/tags             | Obter tags de um produto especifico.                                                                  | loaders/produtos/tags.ts     |
| PUT         | /separacao/{idSeparacao}/situacao       | Altera a situação de uma separação.                                                           | actions/separacao/atualizar-situacao.ts     |
| GET         | /separacao       | Lista as separações.                                                         | loaders/separacao/listar.ts     |
| GET         | /separacao/{idSeparacao}       | Retorna um Objeto separacao.                                                           | loaders/separacao/obter.ts     |
| PUT        | /servicos/{idServico}                      | Atualizar um serviço específico.                                                                                  | actions/servicos/atualizar.ts     |
| GET         | /servicos                                | Listar serviços com filtros e paginação.                                                                          | loaders/servicos/listar.ts     |
| POST        | /servicos                                | Criar um novo serviço.                                                                                           | actions/servicos/criar.ts     |
| POST        | /servicos/{idServico}/transformar-produto  | Transformar um serviço existente em um produto.                                                                | actions/servicos/transformar-produto.ts     |
| GET         | /servicos/{idServico}                      | Obter dados de um serviço especifico.                                                                                | loaders/servicos/obter.ts     |
| GET         | /vendedores                              | Listar vendedores com filtros e paginação.                                                                        | loaders/vendedores/listar.ts     |
