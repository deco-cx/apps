import { SearchRequest, SearchResponse, ChatContextRequest, ChatContextResponse } from "./types.ts";

export interface PineconeAPI {
  "POST /records/namespaces/:namespace/search": {
    response: SearchResponse;
    body: SearchRequest;
  };

  "POST /chat/:assistant_name/context": {
    response: ChatContextResponse;
    body: ChatContextRequest;
  }
}
