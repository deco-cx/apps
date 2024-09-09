import { proxy } from "@deco/deco/web";
import type { Manifest } from "./manifest.gen.ts";

export const invoke = proxy<Manifest>();
