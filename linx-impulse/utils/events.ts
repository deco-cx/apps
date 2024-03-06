import type {
  LinxCartItem,
  LinxProduct,
  LinxUser,
  SearchItem,
} from "./types/analytics.ts";
import type { Source } from "./types/linx.ts";

interface CommonBody {
  apiKey: string;
  origin?: string;
  source: Source;
  deviceId: string;
  salesChannel?: string;
  user?: Omit<LinxUser, "birthday" | "gender" | "name">;
}

export interface EventsAPI {
  "POST /v7/events/views/category": {
    response: void;
    body: {
      categories: string[];
      tags?: string[];
    } & CommonBody;
  };

  "POST /v7/events/views/subcategory": {
    response: void;
    body: {
      categories: string[];
      tags?: string[];
    } & CommonBody;
  };

  "POST /v7/events/views/product": {
    response: void;
    body: CommonBody & LinxProduct;
  };

  "POST /v7/events/views/cart": {
    response: void;
    body: CommonBody & {
      id: string;
      items: LinxCartItem[];
    };
  };

  "POST /v7/events/views/transaction": {
    response: void;
    body: CommonBody & {
      id: string;
      items: LinxCartItem[];
      total: number;
    };
  };

  "POST /v7/events/views/search": {
    response: void;
    body: CommonBody & {
      query: string;
      searchId?: string;
      items: SearchItem[];
    };
  };

  "POST /v7/events/views/emptysearch": {
    response: void;
    body: CommonBody & {
      query: string;
      searchId?: string;
      items: [];
    };
  };

  "POST /v7/events/views/:name": {
    response: void;
    body: CommonBody;
  };
}
