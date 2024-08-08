import { proxy } from "@deco/deco";
import type { Manifest } from "./manifest.gen.ts";

export const invoke = proxy<Manifest>();
