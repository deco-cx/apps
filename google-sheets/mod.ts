import type { App, FnContext } from "@deco/deco";
import { PreviewContainer } from "../utils/preview.tsx";
import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { GoogleSpreadsheet } from "npm:google-spreadsheet@^4.1.4";
import { JWT } from "npm:google-auth-library@^9.14.1";

export type AppContext = FnContext<State, Manifest>;

export interface Props {
  client_email: string;
  private_key: Secret;
  sheet_id: string;
  scopes: string[];
}

// Here we define the state of the app
// You choose what to put in the state
export interface State extends Omit<Props, "token"> {
  doc: GoogleSpreadsheet;
}

/**
 * @title Google Sheets
 * @description This is an app that enables a google spreadsheet integration.
 * @category Tool
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/google-sheets/logo.png
 */
export default function GoogleSheet(props: Props): App<Manifest, State> {
  const SCOPES = props.scopes;

  const jwt = new JWT({
    email: props.client_email,
    key: props.private_key?.get() || "",
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(
    props.sheet_id,
    jwt,
  );

  return {
    state: {
      ...props,
      doc,
    },
    manifest,
  };
}

// It is important to use the same name as the default export of the app
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Google Sheets",
      owner: "deco.cx",
      description:
        "This is an app that enables a google spreadsheet integration.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/google-sheets/logo.png",
      images: [],
      tabs: [],
    },
  };
};
