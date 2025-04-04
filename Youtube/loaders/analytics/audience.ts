import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";

export interface AudienceAnalyticsOptions {
  /**
   * @description ID do canal no formato "channel==CANAL_ID"
   */
  channelId: string;

  /**
   * @description Data de início da consulta (formato: YYYY-MM-DD)
   */
  startDate: string;

  /**
   * @description Data de término da consulta (formato: YYYY-MM-DD)
   */
  endDate: string;

  /**
   * @description Dimensões para segmentação demográfica (age,gender,country)
   */
  dimensions?: string;

  /**
   * @description Campo para ordenação dos resultados
   */
  sort?: string;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

interface AudienceData {
  kind: string;
  columnHeaders: Array<{
    name: string;
    columnType: string;
    dataType: string;
  }>;
  rows: Array<Array<string | number>>;
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    countries: Record<string, number>;
  };
}

/**
 * @title Análise de Audiência do YouTube
 * @description Busca dados demográficos e de audiência de um canal do YouTube
 */
export default async function loader(
  props: AudienceAnalyticsOptions,
  req: Request,
  _ctx: AppContext,
): Promise<AudienceData | null> {
  const {
    channelId,
    startDate,
    endDate,
    dimensions = "ageGroup,gender,country",
    sort = "-viewerPercentage",
    tokenYoutube,
  } = props;

  // Obter o token de acesso
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter dados de audiência");
    return null;
  }

  if (!channelId) {
    console.error("ID do canal é obrigatório");
    return null;
  }

  if (!startDate || !endDate) {
    console.error("Datas de início e término são obrigatórias");
    return null;
  }

  // Validar formato das datas (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    console.error("Datas devem estar no formato YYYY-MM-DD");
    return null;
  }

  try {
    // Vamos fazer múltiplas chamadas para obter dados demográficos diferentes
    const audienceData: AudienceData = {
      kind: "youtubeAnalytics#resultTable",
      columnHeaders: [],
      rows: [],
      demographics: {
        ageGroups: {},
        genders: {},
        countries: {},
      },
    };

    // Separar dimensões para fazer chamadas independentes
    const dimensionsArray = dimensions.split(",").map((d) => d.trim());

    for (const dimension of dimensionsArray) {
      // Construir URL da requisição para cada dimensão
      let url = "https://youtubeanalytics.googleapis.com/v2/reports";

      // Métricas específicas para dados demográficos
      const metrics = "viewerPercentage";

      // Adicionar parâmetros obrigatórios
      const params = new URLSearchParams({
        ids: channelId,
        startDate,
        endDate,
        metrics,
        dimensions: dimension,
        sort,
      });

      url += `?${params.toString()}`;

      // Fazer a requisição para a API do YouTube Analytics
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error(
          `Erro ao buscar dados de ${dimension}: ${response.status} ${response.statusText}`,
        );
        continue;
      }

      // Processar os dados desta dimensão
      const dimensionData = await response.json();

      if (dimensionData.rows && dimensionData.rows.length > 0) {
        // Guardar os headers e rows originais apenas na primeira chamada bem-sucedida
        if (audienceData.columnHeaders.length === 0) {
          audienceData.columnHeaders = dimensionData.columnHeaders;
        }

        // Adicionar todas as linhas aos dados brutos
        audienceData.rows = audienceData.rows.concat(dimensionData.rows);

        // Processar os dados específicos para cada tipo de dimensão
        if (dimension === "ageGroup") {
          dimensionData.rows.forEach((row: any[]) => {
            const ageGroup = row[0] as string;
            const percentage = row[1] as number;
            audienceData.demographics.ageGroups[ageGroup] = percentage;
          });
        } else if (dimension === "gender") {
          dimensionData.rows.forEach((row: any[]) => {
            const gender = row[0] as string;
            const percentage = row[1] as number;
            audienceData.demographics.genders[gender] = percentage;
          });
        } else if (dimension === "country") {
          dimensionData.rows.forEach((row: any[]) => {
            const country = row[0] as string;
            const percentage = row[1] as number;
            audienceData.demographics.countries[country] = percentage;
          });
        }
      }
    }

    return audienceData;
  } catch (error) {
    console.error("Erro ao buscar dados de audiência:", error);
    return null;
  }
}
