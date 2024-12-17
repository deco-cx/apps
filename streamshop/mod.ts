import type { App, FnContext } from "@deco/deco";
import { PreviewContainer } from "./components/ui/Preview.tsx";
import manifest, { Manifest } from "./manifest.gen.ts";

// deno-lint-ignore ban-types
export type State = {};
export type AppContext = FnContext<Manifest>;

/**
 * @title Video Commerce - Stream shop
 * @description Integration of streamshop services.
 * @category Tools
 * @logo https://cdn.prod.website-files.com/6445b237edd0d4b3293ec173/6707f86b939ac3eaea62fe44_SSHOP_AVATAR%20copy%202.png
 */
export default function App(state: State): App<Manifest, State> {
  return { manifest, state };
}

// It is important to use the same name as the default export of the app
export const preview = () => {
  return {
    Component: PreviewContainer,
    props: {
      name: "Video Commerce",
      owner: "StreamShop Technologies",
      description: "Powered by StreamShop",
      logo:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA8FBMVEWbkdCkjcqsicS1hb6+gbjGfbPPea3VdqjYd6XaeKHdeZ7gepvie5jle5XofJHqfY7tfovwf4jygIXzgoLzhIDzhn7ziHzzinrzjHjzjnbzkHTzknLbeprVhqThg5fccJjdqsLz8/j////k1N/Tk6nZcZ3mtcjttcPsnav98PHikKvhcpLpb4LqwdLs4+zeg5LWlLzt4efnjIzDc67ixNruv83zwMf5z8/rzt/SaqHyd3jzjI3ei5Dw3OjbkJfdttHbnaTYpsfcqrLdt7/OhLPnoLbexMz83t27erX5x8X4urn2ravi1un1n5zQq87Rhq/xiwRQAAABEElEQVR4AaXS06IDMRAA0Nq228wWa29tu///NTWSa8zrCUYmk9litdkdTpfb4/X5A8FQOBKNxRPJVDqT/Tnm8vnCJ1gsIQCq/CFWqlAr0Awqf3gTWM4f4Bkq/B6dgli8ZESDFImSKIsiIPESCigKpeKo6agqGIZRv0YDSGw2W5Wil7vW2e5Al8CeXsGaAH0CxQHWoTYMCUSjC3IPHBMI8hlzg9wNmQmJ0zPOQCz5rzgn6gTHFQHE4BkXFI7yAxn6crNBxV+4HKHWFWf89c+VguMAtbBso2vUwVAXW/gmbJCKYXNL4A4+x/YF8Wz308Mhn8+zbEGSaCDq1EaAxypGbkLrPLIix/E8H2m3v9zb/+MJLe5Gr8K2TA8AAAAASUVORK5CYII=",
      images: [
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/e4ce0dd4-1213-4671-acb6-c2d366390d5d/1.png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/34d3586f-995c-4354-ba52-7e10ef89219f/2.png",
        "https://deco-sites-assets.s3.sa-east-1.amazonaws.com/streamshop/dc2b7628-4b5f-425e-88ef-b79f79096f48/3.png",
      ],
      tabs: [],
    },
  };
};
