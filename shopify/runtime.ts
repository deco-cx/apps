import { forApp } from "https://denopkg.com/deco-cx/live@1.27.6/clients/withManifest.ts";

import app from "./mod.ts";

export const Runtime = forApp<ReturnType<typeof app>>();
