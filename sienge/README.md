## WIP: Sienge

> Não implementamos todas as tools ainda, mas aqui já tem o modelo. Basta pedir para o agente continuar quando você precisar de algum específico


Este app permite integração com a plataforma Sienge, um sistema de gestão voltado para o setor de construção civil e imobiliário. A API do Sienge oferece diversos endpoints para acessar e manipular dados de clientes, contratos, obras, finanças e outros módulos do sistema.

## Como utilizar

1. Instale o app em seu site DECO
2. Configure os parâmetros de autenticação:
   - `subdomain`: o subdomínio do cliente no Sienge (ex: minhaempresa)
   - `username`: o nome de usuário da API configurado no Painel de Integrações
   - `password`: a senha da API configurada no Painel de Integrações

## APIs Implementadas

A tabela abaixo mostra as APIs do Sienge que já foram implementadas neste app:

| Arquivo YAML | Loaders | Actions | Observações |
|-------------|---------|---------|------------|
| customers-v1.yaml | - `buscarClientes`: retorna uma lista de clientes com filtros<br>- `buscarCliente`: retorna um cliente específico por ID<br>- `buscarRendasFamiliares`: retorna as rendas familiares de um cliente<br>- `buscarAnexos`: retorna todos os anexos de um cliente<br>- `buscarAnexo`: retorna um anexo específico de um cliente<br>- `buscarProcurador`: retorna os dados do procurador de um cliente | - `adicionarCliente`: cadastra um novo cliente<br>- `adicionarRendasFamiliares`: cadastra rendas familiares<br>- `atualizarEndereco`: atualiza um endereço de tipo específico<br>- `adicionarAnexos`: adiciona anexos a um cliente<br>- `removerAnexo`: remove um anexo específico<br>- `atualizarProcurador`: atualiza dados do procurador | Interface completa implementada com todos os endpoints disponíveis, incluindo gerenciamento de telefones, cônjuge, rendas familiares, endereços, anexos e procuradores. |
| sales-contracts-v1.yaml | - `buscarContratos`: retorna uma lista de contratos de vendas<br>- `buscarContrato`: retorna um contrato específico por ID<br>- `buscarAnexo`: retorna um anexo específico de um contrato<br>- `buscarGarantidores`: retorna os garantidores de um contrato | - `adicionarContrato`: cadastra um novo contrato de venda<br>- `removerAnexo`: remove um anexo do contrato<br>- `adicionarGarantidores`: adiciona garantidores ao contrato<br>- `removerGarantidor`: remove um garantidor específico<br>- `atualizarTelefonesGarantidor`: atualiza telefones de um garantidor<br>- `cancelarContrato`: cancela um contrato de venda<br>- `removerContrato`: remove um contrato de venda | Interface completa implementada com todos os endpoints disponíveis, incluindo gerenciamento de anexos, garantidores e cancelamento de contratos. |
| unit-v1.yaml | - `buscarUnidades`: retorna uma lista de unidades imobiliárias com filtros<br>- `buscarUnidade`: retorna uma unidade específica por ID<br>- `buscarCaracteristicas`: retorna as características cadastradas<br>- `buscarSituacoes`: retorna as situações cadastradas | - `adicionarUnidade`: cadastra uma nova unidade imobiliária<br>- `atualizarUnidade`: atualiza dados de uma unidade existente<br>- `adicionarUnidadesFilhas`: adiciona unidades filhas a uma unidade pai<br>- `adicionarCaracteristica`: cadastra uma nova característica<br>- `atualizarCaracteristicas`: atualiza características de uma unidade<br>- `adicionarSituacao`: cadastra uma nova situação para unidades | Interface completa implementada com endpoints para gerenciamento de unidades imobiliárias, incluindo características, situações e relações entre unidades. |
| enterprise-v1.yaml | - `buscarEmpreendimentos`: retorna uma lista de empreendimentos (obras)<br>- `buscarEmpreendimento`: retorna um empreendimento específico por ID<br>- `buscarAgrupamentos`: retorna os agrupamentos de um empreendimento | - | Interface completa implementada com endpoints principais para consulta de empreendimentos (obras) e seus agrupamentos. |
| cities-v1.yaml | - `buscarMunicipios`: retorna uma lista de municípios com filtros | - | Interface implementada para consulta de municípios (cidades). |
| civil-status-v1.yaml | - `buscarEstadosCivis`: retorna uma lista de estados civis com filtros | - `adicionarEstadoCivil`: cadastra um novo estado civil | Interface completa implementada para gerenciamento de estados civis. |
| professions-v1.yaml | - `buscarProfissoes`: retorna uma lista de profissões com filtros<br>- `buscarProfissao`: retorna uma profissão específica por ID | - `adicionarProfissoes`: cadastra novas profissões | Interface completa implementada para consulta e cadastro de profissões. |
| indexers-v1.yaml | - `buscarIndexadores`: retorna uma lista de indexadores financeiros | - | Interface implementada para consulta de indexadores financeiros. |
| company-v1.yaml | - `buscarEmpresas`: retorna uma lista de empresas cadastradas<br>- `buscarEmpresa`: retorna uma empresa específica por ID | - | Interface implementada para consulta de empresas cadastradas no sistema. |
| customer-types-v1.yaml | - `buscarTiposClientes`: retorna uma lista de tipos de clientes com filtros | - | Interface implementada para consulta de tipos de clientes disponíveis no sistema. |
| payment-condition-types-v1.yaml | - `buscarTiposCondicaoPagamento`: retorna uma lista de tipos de condição de pagamento com filtros | - | Interface implementada para consulta de tipos de condições de pagamento disponíveis no sistema. |
| property-types-v1.yaml | - `buscarTiposImoveis`: retorna uma lista de tipos de imóveis com filtros<br>- `buscarTipoImovel`: retorna um tipo de imóvel específico por ID | - | Interface implementada para consulta de tipos de imóveis cadastrados no sistema. |
| departments-v1.yaml | - `buscarDepartamentos`: retorna uma lista de departamentos cadastrados<br>- `buscarDepartamento`: retorna um departamento específico por ID | - | Interface implementada para consulta de departamentos cadastrados no sistema. |
| document-identification-v1.yaml | - `buscarDocumento`: retorna um documento de identificação específico por ID | - | Interface implementada para consulta de documentos de identificação no sistema. |
| sites-v1.yaml | - `buscarLocais`: retorna uma lista de locais de obra filtrados por ID da obra | - | Interface implementada para consulta de locais de obra no sistema. |
| parameters-v1.yaml | - `buscarParametro`: retorna um parâmetro específico pelo ID | - | Interface implementada para consulta de parâmetros no sistema. |
| cost-center-v1.yaml | - `buscarCentrosDeCusto`: retorna uma lista de centros de custo<br>- `buscarCentroDeCusto`: retorna um centro de custo específico por ID<br>- `buscarContasDisponiveis`: retorna as contas disponíveis para um centro de custo<br>- `buscarConfiguracoes`: retorna as configurações de registro ATO de um centro de custo | - | Interface implementada para consulta de centros de custo, suas contas disponíveis e configurações. |
| unit-bookings-v1.yaml | - | - `adicionarReserva`: cadastra uma nova reserva de unidade<br>- `inativarReserva`: inativa uma reserva de unidade existente | Interface implementada para gerenciamento de reservas de unidades imobiliárias. |
| resource-units-of-movement-v1.yaml | - `buscarUnidadesDeMovimento`: retorna as unidades de movimento dos insumos de uma obra | - | Interface implementada para consulta de unidades de movimento de insumos de obras. |
| building-calendar-v1.yaml | - `buscarCalendario`: retorna o calendário de uma obra<br>- `buscarFolgas`: retorna as folgas do calendário de uma obra | - `atualizarCalendario`: atualiza o calendário de uma obra<br>- `adicionarFolgas`: adiciona folgas ao calendário<br>- `removerFolgas`: remove folgas do calendário | Interface completa implementada para gerenciamento de calendários de obras, incluindo configurações e folgas. |
| building-cost-estimations-v1.yaml | - `buscarPlanilhas`: retorna as planilhas de orçamento de uma obra<br>- `buscarItensPlanilha`: retorna os itens de uma planilha de orçamento | - | Interface implementada para consulta de planilhas de orçamento e seus itens. Cada planilha corresponde a uma unidade construtiva da obra. |
| movable-assets-v1.yaml | - `buscarBensMoveis`: retorna uma lista de bens móveis com diversos filtros | - | Interface implementada para consulta de bens móveis (patrimônio) com detalhes de incorporação e depreciação. |
| fixed-assets-v1.yaml | - `buscarBensImoveis`: retorna uma lista de bens imóveis com diversos filtros | - | Interface implementada para consulta de bens imóveis (patrimônio) com detalhes de incorporação, endereço e depreciação. |
| building-projects-v1.yaml | - `buscarTarefasPlanejamento`: retorna as tarefas da versão atual do planejamento de uma obra | - `atualizarTarefasPlanejamento`: atualiza as tarefas no planejamento de uma obra | Interface implementada para gerenciamento de tarefas no planejamento de obras. |
| creditor-v1.yaml | - `buscarCredores`: retorna uma lista de credores com filtros<br>- `buscarCredor`: retorna um credor específico por ID<br>- `buscarInformacoesBancarias`: retorna as informações bancárias de um credor<br>- `buscarInformacoesPix`: retorna as informações de PIX de um credor | - `adicionarCredor`: cadastra um novo credor<br>- `atualizarCredor`: atualiza dados de um credor existente<br>- `ativarCredor`: ativa um credor desativado<br>- `desativarCredor`: desativa um credor ativo | Interface implementada para gerenciamento de credores, incluindo dados cadastrais, bancários e chaves PIX. |
| accounts-receivable-v1.yaml | - `buscarTitulos`: retorna uma lista de títulos do contas a receber com filtros<br>- `buscarTitulo`: retorna um título específico por ID<br>- `buscarParcelas`: retorna as parcelas de um título<br>- `buscarApropriacoesFinanceiras`: retorna as apropriações financeiras de um título | - `alterarDataVencimentoParcela`: altera a data de vencimento de uma parcela específica | Interface implementada para gerenciamento de títulos do contas a receber, incluindo parcelas e apropriações financeiras. |
| bill-debt-v1.yaml | - `buscarTitulos`: retorna uma lista de títulos do contas a pagar com filtros<br>- `buscarTitulosPorDataAlteracao`: retorna uma lista de títulos alterados no período especificado<br>- `buscarTitulo`: retorna um título específico por ID<br>- `buscarParcelas`: retorna as parcelas de um título | - `adicionarTitulo`: cadastra um novo título no contas a pagar<br>- `atualizarTitulo`: atualiza dados de um título existente<br>- `atualizarParcela`: atualiza uma parcela específica de um título | Interface implementada para gerenciamento de títulos do contas a pagar, incluindo parcelas e informações de pagamento. |

## Limitações de Requisições - Rate-Limits

Por padrão todos os endpoints da API dividem um número máximo de requisições por dia, definido pelo pacote contratado, além de uma limitação de segurança por minuto:

**Limites de Segurança**
- REST: 200 requisições / minuto
- BULK: 20 requisições / minuto

**Pacotes de APIs**
| Pacote | REST | BULK |
|--------|------|------|
| Free | 100* | 10* |
| Start | 1.000 | 20* |
| Special | 2.500 | 50* |
| Essencial | 5.000 | 100* |
| Enterprise | 10.000 | 200* |
| Ultimate | 75.000 | 28.800* |

*Volumes com bloqueio - Ao atingir o limite receberá o retorno 429: To Many Requests

## Lista de APIs Disponíveis

accountancy-accounts-v1.yaml
accountancy-batch-v1.yaml
accountancy-closingaccountancy-v1.yaml
accountancy-entries-v1.yaml
accountancy-entrygenerator-entrybatches-v1.yaml
accounts-balances-v1.yaml
accounts-receivable-v1.yaml ✅
accounts-statements-v1.yaml
bearers-receivable-v1.yaml
bill-debt-v1.yaml ✅
building-calendar-v1.yaml ✅
building-cost-estimation-cost-estimate-resources-v1.yaml
building-cost-estimation-resources-v1.yaml
building-cost-estimations-v1.yaml ✅
building-projects-progress-logs-v1.yaml
building-projects-v1.yaml ✅
bulk-data-account-company-balance-v1.yaml
bulk-data-account-cost-center-balance-v1.yaml
bulk-data-bank-movement-v1.yaml
bulk-data-building-cost-estimations-v1 (1).yaml
bulk-data-building-resource-v1.yaml
bulk-data-business-budget-v1.yaml
bulk-data-customer-debt-balance.yaml
bulk-data-customer-extract-history-v1.yaml
bulk-data-defaulters-receivable-bills-v1.yaml
bulk-data-income-v1.yaml
bulk-data-invoice-items-v1.yaml
bulk-data-outcome-v1.yaml
bulk-data-purchase-quotations-v1.yaml
bulk-data-sales-v1.yaml
checking-accounts-v1.yaml
cities-v1.yaml ✅
civil-status-v1.yaml ✅
collections-notification-history-v1.yaml
commissions-forecasts-v1.yaml
commissions-v1.yaml
company-v1.yaml ✅
construction-daily-report-v1.yaml
contracts-v1.yaml
cost-center-v1.yaml ✅
cost-databases-v1.yaml
creditor-v1.yaml ✅
current-debit-balance-v1.yaml
customer-financial-statements-v1.yaml
customer-income-tax-v1.yaml
customer-types-v1.yaml ✅
customers-v1.yaml ✅
departments-v1.yaml ✅
document-identification-v1.yaml ✅
email-current-debit-balance-v1.yaml
enterprise-v1.yaml ✅
fixed-assets-v1.yaml ✅
hooks-v1.yaml
indexers-v1.yaml ✅
measurement-v1.yaml
movable-assets-v1.yaml ✅
nfe-api-v1.yaml
overdue-receivable-v1.yaml
parameters-v1.yaml ✅
payment-categories-v1.yaml
payment-condition-types-v1.yaml ✅
payment-slip-notification-v1.yaml
prepayment-slip-register-v1.yaml
price-tables-v1.yaml
professions-v1.yaml ✅
property-rental-v1.yaml
property-types-v1.yaml ✅
purchase-invoices-v1.yaml
purchase-orders-v1.yaml
purchase-quotations-v1.yaml
purchase-requests-v1.yaml
real-estate-map-v1.yaml
remade-installments-v1.yaml
resource-units-of-movement-v1.yaml ✅
sales-contracts-v1.yaml ✅
sites-v1.yaml ✅
stock-inventories-v1.yaml
tax-information-v1.yaml
total-current-debit-balance-v1.yaml
trial-balance-v1.yaml
unit-bookings-v1.yaml ✅
unit-v1.yaml ✅