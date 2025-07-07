import { SearchResults } from "../client.ts";

interface Props {
  /**
   * @description Search by keyword (searches in title and description).
   */
  q?: string;
  /**
   * @description Filter by document type.
   * @default "edital"
   */
  tipos_documento?: "edital" | "contrato" | "ata" | "planocontratacao";
  /**
   * @description Sort order by date.
   * @default "-data"
   */
  ordenacao?: "-data" | "data";
  /**
   * @description Page number for pagination.
   * @default 1
   */
  pagina?: number;
  /**
   * @description Page size for pagination.
   * @default 10
   */
  tam_pagina?: number;
  /**
   * @description Filter by procurement status. Required parameter. Values: recebendo_proposta=Currently accepting proposals (~34k results), analise=Under analysis (~2.2M results), encerrado=Closed/finished (~2.2M results)
   */
  status: "recebendo_proposta" | "analise" | "encerrado";
  /**
   * @description Filter by state (UF). Use 2-letter state code (e.g., SP, RJ, MG).
   */
  uf?: string;
  /**
   * @description Filter by municipality code (IBGE code).
   */
  codigo_municipio?: string;
  /**
   * @description Filter by organization code.
   */
  codigo_orgao?: string;
  /**
   * @description Filter by organization CNPJ (14 digits, numbers only).
   */
  cnpj_orgao?: string;
  /**
   * @description Start date for filtering (format: yyyyMMdd, e.g., 20240101).
   */
  data_inicio?: string;
  /**
   * @description End date for filtering (format: yyyyMMdd, e.g., 20241231).
   */
  data_fim?: string;
}

/**
 * @title PNCP - Search Public Contracts
 * @description Search for public contracts, bids, and other procurement documents on the PNCP portal. This endpoint searches across editals, contracts, price registration records, and contracting plans.
 */
const loader = async (
  props: Props,
  _req: Request,
): Promise<SearchResults> => {
  const { pagina = 1, tam_pagina = 10, ...searchParams } = props;

  // Build search parameters
  const params = new URLSearchParams();

  if (searchParams.q) params.append("q", searchParams.q);
  if (searchParams.tipos_documento) {
    params.append("tipos_documento", searchParams.tipos_documento);
  }
  if (searchParams.ordenacao) {
    params.append("ordenacao", searchParams.ordenacao);
  }
  if (searchParams.uf) params.append("uf", searchParams.uf);
  if (searchParams.codigo_municipio) {
    params.append("codigo_municipio", searchParams.codigo_municipio);
  }
  if (searchParams.codigo_orgao) {
    params.append("codigo_orgao", searchParams.codigo_orgao);
  }
  if (searchParams.cnpj_orgao) {
    params.append("cnpj_orgao", searchParams.cnpj_orgao);
  }
  if (searchParams.data_inicio) {
    params.append("data_inicio", searchParams.data_inicio);
  }
  if (searchParams.data_fim) params.append("data_fim", searchParams.data_fim);

  // Required parameters
  params.append("status", searchParams.status);
  params.append("pagina", pagina.toString());
  params.append("tam_pagina", tam_pagina.toString());

  // Make direct fetch call to the search endpoint (different base URL)
  const url = `https://pncp.gov.br/api/search/?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `PNCP Search API error: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
};

export default loader;
