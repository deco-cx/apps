import { forApp } from "$live/clients/withManifest.ts";

import app from "./mod.ts";

export const Runtime = forApp<ReturnType<typeof app>>();
