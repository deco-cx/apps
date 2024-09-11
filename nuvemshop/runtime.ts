import { proxy } from "deco/clients/withManifest.ts";
import { Manifest } from "./manifest.gen.ts";

export const invoke = proxy<Manifest>();
