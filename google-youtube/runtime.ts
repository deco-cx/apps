import { Manifest } from "./manifest.gen.ts";
import { proxy } from "@deco/deco/web";
export const invoke = proxy<Manifest>();
