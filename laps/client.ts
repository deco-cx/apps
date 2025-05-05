// Define data types/interfaces based on the API response
export interface Cliente {
  "Código do Cliente": number;
  "Nome do Cliente": string;
  "Razão Social": string;
  "Endereço": string;
  "Cidade": string;
  "UF": string;
  "Fone Resid": string;
  "E-mail": string | null;
}

export interface Item {
  codigo: number;
  quantidade: number;
  valorUnitario: number;
  descricao: string;
  observacao: string | null;
  dataHora: string;
  tipoItem: string;
  codigoMecanico: number;
}

export interface HistoricoItem {
  codigoVenda: number;
  dataVenda: string;
  quilometragem: number;
  marca: string | null;
  modelo: string;
  anoFabricacao: string;
  chassi: string | null;
  observacaoGeral: string | null;
  itens: Item[];
}

export interface VehicleHistory {
  placa: string;
  ultimoDono: Cliente;
  historico: HistoricoItem[];
}

// Client interface following the pattern for createHttpClient
export interface LapsClient {
  "GET /historico": {
    response: VehicleHistory;
    searchParams: {
      placa: string;
    };
  };
}
