import proxy from "../../website/handlers/proxy.ts";
export interface Props {
  site: string;
}

export default function ghProxy({ site }: Props) {
  console.log("here", site);
  return proxy({
    url: "https://github.com",
    basePath: `deco-sites/storefront.git`,
  });
}
