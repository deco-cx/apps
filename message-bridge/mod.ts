import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";

let kv: Deno.Kv | null = null;
try {
  kv = await Deno?.openKv().catch((_err) => null);
} catch {
  console.warn("please run with `--unstable` to enable deno kv support");
}

interface State {
  kv: Deno.Kv;
  toBridgeMessage: (message: unknown) => BridgeMessage;
}

interface BridgeMessage {
  content: string
}

interface Props {
  toBridgeMessage: (message: unknown) => BridgeMessage;
}

/**
 * @title Message Bridge
 * @name Message Bridge
 * @description This is a message bridge that allows you to bridge messages between two different channels.
 * @category Tool
 * @logo https://ozksgdmyrqcxcwhnbepg.supabase.co/storage/v1/object/public/assets/1/0ac02239-61e6-4289-8a36-e78c0975bcc8
 */
export default function MessageBridge({
  toBridgeMessage,
}: Props): App<Manifest, State> {
  if (!kv) {
    throw new Error("please run with `--unstable` to enable deno kv support");
  }

  return {
    state: {
      kv,
      toBridgeMessage,
    },
    manifest,
    dependencies: [],
  };
}
export type MessageBridgeApp = ReturnType<typeof MessageBridge>;
export type AppContext = AC<MessageBridgeApp>;
