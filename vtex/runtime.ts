import { proxy } from "$live/clients/withManifest.ts";
import { Manifest } from "./manifest.gen.ts";

export const Runtime = proxy<Manifest>();
