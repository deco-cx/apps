# PNCP - Portal Nacional de Contratações Públicas

App para acessar as APIs abertas do Portal Nacional de Contratações Públicas (PNCP).

## Sobre o PNCP

O Portal Nacional de Contratações Públicas (PNCP) é uma plataforma do governo brasileiro que centraliza informações sobre licitações e contratos públicos de todos os entes federativos (União, Estados, Distrito Federal e Municípios).

## Funcionalidades

Este app permite:

- **Buscar documentos**: Buscar editais, contratos, atas e outros documentos
- **Obter detalhes**: Acessar informações detalhadas de documentos específicos
- **Listar órgãos**: Consultar órgãos públicos cadastrados
- **Obter estatísticas**: Acessar estatísticas gerais do portal

## Configuração

### Parâmetros de Configuração

- **Base URL**: URL base da API do PNCP (padrão: https://pncp.gov.br)
- **User Agent**: Identificação para as requisições (padrão: PNCP-Deco-App/1.0)
- **Timeout**: Tempo limite para requisições em milissegundos (padrão: 30000)
- **Rate Limit**: Limite de requisições por minuto (padrão: 60)

## Loaders Disponíveis

### Buscar Documentos (`buscarDocumentos`)

Busca documentos no PNCP com diversos filtros:

- **Tipos de documento**: edital, contrato, ata, etc.
- **Status**: recebendo_proposta, encerrado, etc.
- **Ordenação**: por data, valor, etc.
- **Filtros geográficos**: UF, município
- **Filtros de valor**: valor mínimo e máximo
- **Filtros de data**: data inicial e final
- **Busca textual**: busca livre por palavras-chave

### Obter Documento (`obterDocumento`)

Obtém detalhes completos de um documento específico pelo ID.

### Listar Órgãos (`listarOrgaos`)

Lista órgãos públicos cadastrados com filtros por:
- UF
- Esfera (federal, estadual, municipal)
- Poder (executivo, legislativo, judiciário)
- Busca textual

### Obter Órgão (`obterOrgao`)

Obtém detalhes de um órgão específico pelo CNPJ.

### Obter Estatísticas (`obterEstatisticas`)

Obtém estatísticas gerais do PNCP com filtros por data e UF.

## Exemplos de Uso

### Buscar Editais Abertos

```typescript
{
  "tipos_documento": "edital",
  "status": "recebendo_proposta",
  "uf": "SP",
  "ordenacao": "-data",
  "tam_pagina": 20
}
```

### Buscar Contratos por Valor

```typescript
{
  "tipos_documento": "contrato",
  "valor_min": 10000,
  "valor_max": 100000,
  "data_inicial": "2024-01-01",
  "data_final": "2024-12-31"
}
```

### Buscar Órgãos Federais

```typescript
{
  "esfera": "federal",
  "poder": "executivo",
  "uf": "DF"
}
```

## Dados Retornados

### Documentos

Os documentos retornados incluem:
- Identificador único
- Número e tipo do documento
- Título e descrição
- Datas (publicação, abertura, encerramento)
- Status atual
- Valor estimado
- Modalidade e critério de julgamento
- Informações do órgão responsável
- Links para documentos e anexos

### Órgãos

Os órgãos incluem:
- CNPJ e nome
- UF e município
- Esfera e poder
- Informações de contato

### Estatísticas

As estatísticas incluem:
- Totais por tipo de documento
- Distribuição por UF
- Distribuição por status
- Valores totais de contratações

## Transparência e Dados Abertos

Este app facilita o acesso aos dados públicos de contratações, promovendo:
- Transparência na administração pública
- Controle social
- Análise de dados de contratações
- Monitoramento de processos licitatórios

## Conformidade

O app está em conformidade com:
- Lei de Acesso à Informação (LAI)
- Decreto nº 8.777/2016 (Política de Dados Abertos)
- Lei nº 14.133/2021 (Nova Lei de Licitações)

## Suporte

Para questões relacionadas aos dados ou à API do PNCP, consulte:
- Portal oficial: https://pncp.gov.br
- Documentação de dados abertos: https://www.gov.br/pncp/pt-br/acesso-a-informacao/dados-abertos