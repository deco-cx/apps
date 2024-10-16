import { InteractionResponseTypes } from "../../../deps/discordeno.ts";

export default function ping() {
  return new Response(
    JSON.stringify({
      type: InteractionResponseTypes.Pong,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
