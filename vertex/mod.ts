import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createVertex } from "npm:@ai-sdk/google-vertex/edge";
import { Secret } from "../website/loaders/secret.ts";

interface State {
  vertexClient: ReturnType<typeof createVertex>;
}

interface Props {
  /**
   * @title Google Cloud Credentials
   */
  googleCredentials: {
    clientEmail: Secret;
    privateKeyId: Secret;
    privateKey: Secret;
  };
  /**
   * @title Location
   */
  location: Secret;
  /**
   * @title Project
   */
  project: Secret;
}
/**
 * @title Vertex
 * @name Vertex
 * @description Vertex tools
 * @category Tool
 * @logo https://ozksgdmyrqcxcwhnbepg.supabase.co/storage/v1/object/public/assets/1/0ac02239-61e6-4289-8a36-e78c0975bcc8
 */
export default function Vertex(props: Props): App<Manifest, State> {
  const { googleCredentials, location, project } = props;
  const vertex = createVertex({
    googleCredentials: {
      clientEmail: googleCredentials.clientEmail.get(),
      privateKeyId: googleCredentials.privateKeyId.get(),
      privateKey: googleCredentials.privateKey.get(),
    },
    location: location.get(),
    project: project.get(),
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
