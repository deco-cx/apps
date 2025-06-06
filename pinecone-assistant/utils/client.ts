import { ChatContextRequest, ChatContextResponse } from "./types.ts";

export interface PineconeAPI {
  "POST /assistant/chat/:assistant_name/context": {
    response: ChatContextResponse;
    body: ChatContextRequest;
  };
}
