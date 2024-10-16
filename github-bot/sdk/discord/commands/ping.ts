import {
  InteractionResponseTypes,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";

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
