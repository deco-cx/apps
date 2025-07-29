# SuperFrete App

Integração com a API da SuperFrete para cotação e gestão de fretes no Brasil.

## Configuração

Para utilizar este app, você precisa:

1. **Token de API**: Obtenha seu token de API no painel da SuperFrete
2. **Ambiente**: Escolha entre `sandbox` (testes) ou `production` (produção)

### Variáveis de Configuração

- `token`: Token de autenticação da API SuperFrete
- `environment`: Ambiente da API (`sandbox` ou `production`)
- `timeout`: Tempo limite para requisições em millisegundos (padrão: 30000)

## Funcionalidades

### Loaders (Consultas)

#### `freight-quote`
Calcula o valor do frete para uma encomenda baseado em CEPs e características dos produtos.

**Parâmetros:**
- `fromPostalCode`: CEP de origem
- `toPostalCode`: CEP de destino
- `services`: Códigos dos serviços (1: PAC, 2: Sedex, 17: Mini Envios)
- `ownHand`: Serviço de Mão Própria
- `receipt`: Aviso de Recebimento
- `insuranceValue`: Valor do seguro
- `useInsuranceValue`: Usar seguro
- `package`: Dimensões da caixa (opcional)
- `products`: Lista de produtos individuais (opcional)

#### `services-info`
Obtém informações sobre os serviços de entrega disponíveis.

#### `user-info`
Obtém informações do usuário autenticado.

#### `order-info`
Obtém informações detalhadas de um pedido específico.

**Parâmetros:**
- `orderId`: ID do pedido

#### `addresses`
Lista todos os endereços cadastrados do usuário.

### Actions (Operações)

#### `create-shipping`
Envia um frete para a SuperFrete.

**Parâmetros:**
- `service`: ID do serviço de entrega
- `from`: Informações do remetente
- `to`: Informações do destinatário
- `products`: Lista de produtos
- `volumes`: Informações dos volumes
- `options`: Opções adicionais

#### `generate-label`
Finaliza o pedido e gera a etiqueta de envio.

**Parâmetros:**
- `orderId`: ID do pedido

#### `cancel-order`
Cancela um pedido.

**Parâmetros:**
- `orderId`: ID do pedido

#### `print-label`
Obtém o link para impressão da etiqueta de um pedido.

**Parâmetros:**
- `orderId`: ID do pedido

## Códigos de Serviços

- `1`: PAC (Empresa Brasileira de Correios e Telégrafos)
- `2`: Sedex (Empresa Brasileira de Correios e Telégrafos)
- `17`: Mini Envios

## Exemplo de Uso

### Cotação de Frete

```typescript
// Usando dimensões da caixa
const quote = await ctx.invoke("superfrete/loaders/freight-quote", {
  fromPostalCode: "01310-100",
  toPostalCode: "20040-020",
  services: "1,2",
  package: {
    weight: 1.5,
    height: 10,
    width: 15,
    length: 20
  }
});

// Usando produtos individuais
const quote2 = await ctx.invoke("superfrete/loaders/freight-quote", {
  fromPostalCode: "01310-100",
  toPostalCode: "20040-020",
  services: "1,2",
  products: [
    {
      quantity: 2,
      weight: 0.5,
      height: 5,
      width: 10,
      length: 15
    }
  ]
});
```

### Criar Frete

```typescript
const order = await ctx.invoke("superfrete/actions/create-shipping", {
  service: 2, // Sedex
  from: {
    name: "Empresa Remetente",
    phone: "11999999999",
    email: "remetente@empresa.com",
    document: "12345678901",
    address: "Rua das Flores, 123",
    number: "123",
    district: "Centro",
    city: "São Paulo",
    country_id: "BR",
    postal_code: "01310-100"
  },
  to: {
    name: "Cliente Destinatário",
    phone: "21999999999",
    email: "cliente@email.com",
    document: "98765432100",
    address: "Av. Atlântica, 456",
    number: "456",
    district: "Copacabana",
    city: "Rio de Janeiro",
    country_id: "BR",
    postal_code: "20040-020"
  },
  products: [
    {
      quantity: 1,
      weight: 1.5,
      height: 10,
      width: 15,
      length: 20
    }
  ],
  volumes: [
    {
      weight: 1.5,
      height: 10,
      width: 15,
      length: 20
    }
  ]
});
```

## Documentação da API

Para mais detalhes sobre a API da SuperFrete, consulte:
- [Documentação oficial](https://superfrete.readme.io/reference)
- [Cotação de frete](https://superfrete.readme.io/reference/cotacao-de-frete)
- [Informações dos pacotes](https://superfrete.readme.io/reference/informa%C3%A7%C3%B5es-dos-pacotes)

## Ambientes

### Sandbox
- URL: `https://sandbox.superfrete.com`
- Para testes e desenvolvimento

### Produção
- URL: `https://api.superfrete.com`
- Para uso em produção

## Suporte

Para questões sobre o app ou a integração com a SuperFrete, consulte a documentação oficial ou entre em contato com o suporte da SuperFrete. 