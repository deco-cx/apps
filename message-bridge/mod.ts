import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";

let kv: Deno.Kv | null = null;
try {
  kv = await Deno?.openKv().catch((_err) => null);
} catch {
  console.warn("please run with `--unstable` to enable deno kv support");
}

interface BridgeConnector<TIn = unknown, TOut = unknown> {
  toBridgeMessage: (message: TIn) => Promise<BridgeRequest>;
  replyMessage: (resp: BridgeRequest) => Promise<TOut>;
}

interface State {
  kv: Deno.Kv;
  // connector: BridgeConnector;
}

export interface BridgeRequest {
  prompt: string;
}

interface Props {
  // connector: BridgeConnector;
}

/**
 * @title Message Bridge
 * @name MessageBridge
 * @description This is a message bridge that allows you to bridge messages between two different channels.
 * @category Tool
 * @logo https://ozksgdmyrqcxcwhnbepg.supabase.co/storage/v1/object/public/assets/1/0ac02239-61e6-4289-8a36-e78c0975bcc8
 */
export default function MessageBridge({  }: Props): App<Manifest, State> {
  if (!kv) {
    throw new Error("please run with `--unstable` to enable deno kv support");
  }

  return {
    state: {
      kv,
      // connector,
    },
    manifest,
    dependencies: [],
  };
}
export type MessageBridgeApp = ReturnType<typeof MessageBridge>;
export type AppContext = AC<MessageBridgeApp>;
