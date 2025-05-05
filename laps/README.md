# LAPS Integration

This app integrates with the vehicle maintenance history API that provides information about vehicle service records.

## Features

- Fetch vehicle maintenance history by license plate
- Get details about vehicle service history, including parts, services, and mileage
- Access owner information associated with the vehicle

## Setup

1. Install the app in your deco site
2. Configure the app with the base URL (e.g., `https://pp.campinagrande.br`)
3. Optionally provide an API key if required for authentication

## Usage

### Get Vehicle History

```ts
import { useLoader } from "@deco/deco";
import type { VehicleHistory } from "apps/laps/client.ts";

const vehicleHistory = useLoader<VehicleHistory>(
  "laps/loaders/getVehicleHistory.ts",
  {
    placa: "PFW1740", // Vehicle license plate
  }
);
```

## API Response Example

```json
{
  "placa": "pfw1740",
  "ultimoDono": {
    "Código do Cliente": 11107,
    "Nome do Cliente": "RISONALDO DE OLIVEIRA BARBOSA",
    "Razão Social": "RISONALDO DE OLIVEIRA BARBOSA",
    "Endereço": "R:DAMASCO",
    "Cidade": "CAMPINA GRANDE",
    "UF": "PB",
    "Fone Resid": "988307985",
    "E-mail": null
  },
  "historico": [
    {
      "codigoVenda": 13150,
      "dataVenda": "2025-04-29T00:00:00.000Z",
      "quilometragem": 168710,
      "marca": null,
      "modelo": "SIENA 2013 1.4",
      "anoFabricacao": "0",
      "chassi": null,
      "observacaoGeral": null,
      "itens": [
        {
          "codigo": 7454,
          "quantidade": 1,
          "valorUnitario": 120,
          "descricao": "BOMBA AGUA FIAT 2.0 20143 SCHADEK",
          "observacao": null,
          "dataHora": "2025-04-28T17:16:29.000Z",
          "tipoItem": "Produto",
          "codigoMecanico": 0
        }
      ]
    }
  ]
}
``` 