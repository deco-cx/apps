import { State } from "../mod.ts";
import { createRestClient } from "./baseClient.ts";

// Tipos para documentos de identificação
export interface DocumentIdentification {
  id: number;
  name: string;
}

// Interface do cliente de API
export interface DocumentIdentificationsClient {
  "GET /document-identifications/:documentIdentificationId": {
    response: DocumentIdentification;
  };
}

// Função para criar cliente da API
export function createDocumentIdentificationsClient(state: State) {
  return createRestClient<DocumentIdentificationsClient>(state);
}
