import type {
  PageName,
  RecommendationsResponse,
  UserIdType,
} from "./types/chaordic.ts";
import type { ProductFormat, Source } from "./types/linx.ts";

export interface ChaordicAPI {
  "GET /v0/pages/recommendations": {
    response: RecommendationsResponse;
    searchParams: {
      apiKey: string;
      secretKey: string;
      name: PageName;
      source: Source;
      deviceId: string;
      url?: string;
      "categoryId[]"?: string[];
      "tagId[]"?: string[];
      "productId[]"?: string[];
      userId?: string;
      productFormat?: ProductFormat;
      salesChannel?: string;
      dummy?: boolean;
      homologation?: boolean;
      showOnlyAvailable?: boolean;
      userIdType?: UserIdType;
    };
  };
}
