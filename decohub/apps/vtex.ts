export { default } from "../../vtex/mod.ts";

import { AppRuntime } from "deco/types.ts";
import { Preview } from "../preview/Preview.tsx";
import { Markdown2 } from "../components/PreviewMarkdown.tsx";

const CONFIG = {
  name: "Vtex",
  author: "deco.cx",
  description:
    "Loaders, actions and workflows for adding Vtex Commerce Platform to your website.",
  icon: "https://raw.githubusercontent.com/deco-cx/apps/main/vtex/logo.png",
  images: [
    "https://s3-alpha-sig.figma.com/img/4d12/14c4/bbd732fc9acaa32289c2f8f931376c67?Expires=1713139200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=m5-bEvFJYlJIeMpRuM7YhWLNMo-1w6IFOj17Kl3tPSU5BFDtjStBbmD5yNAjn4h9wjjkkg8C9r2tlq3-7XR3HGUKDQSBOqJujyB9dUCI~K4mt~fQOfdk3e93gBtHa1XcY0gLWJYwd~VzZdvePqj8NShTef7BMDCURsQyZ2kz0ESRMoxBrTuVRp4sNdV~AEPH6rVUoR7bXR~880FPevvDmQTjYvEuH2dt4GnLyyVv8rpPsz8YFWuUgv-E6IzWFX6OIQXDOVbGAetxcTIocn16~oFIp9WEXGtyyHZOFh3z~bq3jBR~WekpShBpIqJKZdsskXTfEywCzAqgpTrCU-CCXg__",
    "https://s3-alpha-sig.figma.com/img/4d12/14c4/bbd732fc9acaa32289c2f8f931376c67?Expires=1713139200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=m5-bEvFJYlJIeMpRuM7YhWLNMo-1w6IFOj17Kl3tPSU5BFDtjStBbmD5yNAjn4h9wjjkkg8C9r2tlq3-7XR3HGUKDQSBOqJujyB9dUCI~K4mt~fQOfdk3e93gBtHa1XcY0gLWJYwd~VzZdvePqj8NShTef7BMDCURsQyZ2kz0ESRMoxBrTuVRp4sNdV~AEPH6rVUoR7bXR~880FPevvDmQTjYvEuH2dt4GnLyyVv8rpPsz8YFWuUgv-E6IzWFX6OIQXDOVbGAetxcTIocn16~oFIp9WEXGtyyHZOFh3z~bq3jBR~WekpShBpIqJKZdsskXTfEywCzAqgpTrCU-CCXg__",
    "https://s3-alpha-sig.figma.com/img/4d12/14c4/bbd732fc9acaa32289c2f8f931376c67?Expires=1713139200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=m5-bEvFJYlJIeMpRuM7YhWLNMo-1w6IFOj17Kl3tPSU5BFDtjStBbmD5yNAjn4h9wjjkkg8C9r2tlq3-7XR3HGUKDQSBOqJujyB9dUCI~K4mt~fQOfdk3e93gBtHa1XcY0gLWJYwd~VzZdvePqj8NShTef7BMDCURsQyZ2kz0ESRMoxBrTuVRp4sNdV~AEPH6rVUoR7bXR~880FPevvDmQTjYvEuH2dt4GnLyyVv8rpPsz8YFWuUgv-E6IzWFX6OIQXDOVbGAetxcTIocn16~oFIp9WEXGtyyHZOFh3z~bq3jBR~WekpShBpIqJKZdsskXTfEywCzAqgpTrCU-CCXg__",
    "https://s3-alpha-sig.figma.com/img/4d12/14c4/bbd732fc9acaa32289c2f8f931376c67?Expires=1713139200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=m5-bEvFJYlJIeMpRuM7YhWLNMo-1w6IFOj17Kl3tPSU5BFDtjStBbmD5yNAjn4h9wjjkkg8C9r2tlq3-7XR3HGUKDQSBOqJujyB9dUCI~K4mt~fQOfdk3e93gBtHa1XcY0gLWJYwd~VzZdvePqj8NShTef7BMDCURsQyZ2kz0ESRMoxBrTuVRp4sNdV~AEPH6rVUoR7bXR~880FPevvDmQTjYvEuH2dt4GnLyyVv8rpPsz8YFWuUgv-E6IzWFX6OIQXDOVbGAetxcTIocn16~oFIp9WEXGtyyHZOFh3z~bq3jBR~WekpShBpIqJKZdsskXTfEywCzAqgpTrCU-CCXg__",
  ],
};

export const preview = async (props: AppRuntime) => {
  const markdownContent = await Markdown2(
    new URL("../../vtex/README.md", import.meta.url).href,
  );
  const markdownContent2 = await Markdown2(
    new URL("../../vtex/golive.md", import.meta.url).href,
  );

  return {
    Component: Preview,
    props: {
      ...props,
      config: {
        ...CONFIG,
        pages: [
          { title: "About", content: markdownContent },
          { title: "Go live instructions", content: markdownContent2 },
        ],
      },
    },
  };
};
