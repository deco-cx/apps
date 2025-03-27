import { type App, type AppContext as AC } from "@deco/deco";
import manifest, { Manifest } from "./manifest.gen.ts";
import { createVertex } from "npm:@ai-sdk/google-vertex/edge";

interface State {
  vertexClient: ReturnType<typeof createVertex>;
}

interface Props {
  googleCredentials: {
    clientEmail: string;
    privateKeyId: string;
    privateKey: string;
  };
}
/**
 * @title Vertex
 * @name Vertex
 * @description Vertex tools
 * @category Tool
 * @logo https://ozksgdmyrqcxcwhnbepg.supabase.co/storage/v1/object/public/assets/1/0ac02239-61e6-4289-8a36-e78c0975bcc8
 */
export default function Vertex(props: Props): App<Manifest, State> {
  const vertex = createVertex({
    googleCredentials: props.googleCredentials,
    location: "us-central1",
    project: "flawless-empire-447101-h3",
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
