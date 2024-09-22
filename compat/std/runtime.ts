import app from "./mod.ts";
import { forApp } from "@deco/deco/web";
export const Runtime = forApp<ReturnType<typeof app>>();
