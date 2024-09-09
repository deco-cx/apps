import { forApp } from "@deco/deco/web";
import app from "./mod.ts";

export const Runtime = forApp<ReturnType<typeof app>>();
