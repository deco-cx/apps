import { forApp } from "@deco/deco";
import app from "./mod.ts";

export const Runtime = forApp<ReturnType<typeof app>>();
