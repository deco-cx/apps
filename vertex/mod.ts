import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createVertex } from "npm:@ai-sdk/google-vertex@2.2.1/edge";
import { Secret } from "../website/loaders/secret.ts";

interface State {
  vertexClient: ReturnType<typeof createVertex>;
}

interface Props {
  /**
   * @description The Google Cloud credentials to use
   */
  googleCredentials: {
    clientEmail: Secret | string;
    privateKeyId: Secret | string;
    privateKey: Secret | string;
  };
  /**
   * @description The Google Cloud region to use
   */
  location: Secret | string;
  /**
   * @description The Google Cloud project to use
   */
  project: Secret | string;
}
/**
 * @title Vertex
 * @appName vertex
 * @description Use Google’s Vertex AI for language, vision, and generative tasks.
 * @category Tool
 * @logo https://assets.decocache.com/mcp/156feb88-2648-43e0-b7d9-40c1bc2e1d1d/Vertex.svg
 */
export default function Vertex(props: Props): App<Manifest, State> {
  const { googleCredentials, location, project } = props;
  const vertex = createVertex({
    googleCredentials: {
      clientEmail: typeof googleCredentials.clientEmail === "string"
        ? googleCredentials.clientEmail
        : googleCredentials.clientEmail.get() || "",
      privateKeyId: typeof googleCredentials.privateKeyId === "string"
        ? googleCredentials.privateKeyId
        : googleCredentials.privateKeyId.get() || "",
      privateKey: typeof googleCredentials.privateKey === "string"
        ? googleCredentials.privateKey
        : googleCredentials.privateKey.get() || "",
    },
    location: typeof location === "string" ? location : location.get() || "",
    project: typeof project === "string" ? project : project.get() || "",
  });

  return {
    state: {
      vertexClient: vertex,
    },
    manifest,
    dependencies: [],
  };
}
export type VertexApp = ReturnType<typeof Vertex>;
export type AppContext = AC<VertexApp>;
