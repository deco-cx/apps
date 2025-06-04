import { createHttpClient } from "../utils/http.ts";
import { fetchSafe } from "../utils/fetch.ts";
import {
  FluxImageGenerationRequest,
  FluxImageGenerationResponse,
  FluxResultResponse,
} from "./types.ts";

export interface FluxClient {
  "POST /v1/flux-kontext-pro": {
    body: FluxImageGenerationRequest;
    response: FluxImageGenerationResponse;
  };
  "GET /v1/get_result": {
    searchParams: {
      id: string;
    };
    response: FluxResultResponse;
  };
}

export const createFluxClient = (
  apiKey: string,
  base = "https://api.bfl.ai/v1/",
) => {
  return createHttpClient<FluxClient>({
    base,
    headers: new Headers({
      "Content-Type": "application/json",
      "x-key": apiKey,
    }),
    fetcher: fetchSafe,
  });
};
