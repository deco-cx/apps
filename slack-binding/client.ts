export interface SlackClient {
  // Forwards any event to the real webhook URL
  "POST /webhook": {
    response: unknown;
    body: unknown;
  };
}
