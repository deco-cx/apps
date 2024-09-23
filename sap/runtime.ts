import { proxy } from "@deco/deco/web";
import { Manifest } from "./manifest.gen.ts";

export const invoke = proxy<Manifest>();
