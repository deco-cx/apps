import type { Secret } from "../website/loaders/secret.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { PreviewContainer } from "../utils/preview.tsx";
import { type App, type AppContext as AC } from "@deco/deco";
export interface ConfigVerifiedReviews {
  idWebsite: string;
  secretKey?: Secret;
  plateforme?: string;
}
/**
 * @title Verified Reviews
 * @description A specialized solution in the collection of customer reviews
 * @category Review
 * @logo https://raw.githubusercontent.com/deco-cx/apps/main/verified-reviews/logo.png
 */
export default function App(
  state: ConfigVerifiedReviews,
): App<Manifest, ConfigVerifiedReviews> {
  return { manifest, state };
}
export type AppContext = AC<ReturnType<typeof App>>;
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Verified Reviews",
      owner: "deco.cx",
      description:
        "A specialized solution in the collection of customer reviews.",
      logo:
        "https://raw.githubusercontent.com/deco-cx/apps/main/verified-reviews/logo.png",
      images: [],
      tabs: [],
    },
  };
};
