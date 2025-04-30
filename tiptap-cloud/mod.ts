import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { Secret } from "../website/loaders/secret.ts";

interface State {
  appId: string;
  apiSecret: string;
  baseUrl: string;
}

interface Props {
  /**
   * @description The Tiptap Cloud app ID
   */
  appId: Secret | string;
  /**
   * @description The Tiptap Cloud API secret
   */
  apiSecret: string;
}

/**
 * @title TipTap Cloud
 * @name TiptapCloud
 * @description Tiptap Cloud Collaboration REST API for document management
 * @category Content
 * @logo https://images.saasworthy.com/tiptap_44708_logo_1691501025_zyt0n.png
 */
export default function TiptapCloud(props: Props): App<Manifest, State> {
  const { appId, apiSecret } = props;

  const resolvedAppId = typeof appId === "string" ? appId : appId.get() || "";

  const resolvedApiSecret = apiSecret || "";

  const baseUrl = `https://${resolvedAppId}.collab.tiptap.cloud`;

  return {
    state: {
      appId: resolvedAppId,
      apiSecret: resolvedApiSecret,
      baseUrl,
    },
    manifest,
    dependencies: [],
  };
}

export type TiptapCloudApp = ReturnType<typeof TiptapCloud>;
export type AppContext = AC<TiptapCloudApp>;
