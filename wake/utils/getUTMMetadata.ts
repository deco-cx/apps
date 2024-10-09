import { Metadata } from "../actions/cart/addMetadata.ts";

const UTM_METADATA_KEYS = [
  { urlKey: "utm_campaign", metaKey: "utmCampaign" },
  { urlKey: "utm_medium", metaKey: "utmMedium" },
  { urlKey: "utm_term", metaKey: "utmTerm" },
  { urlKey: "utm_source", metaKey: "utmSource" },
  { urlKey: "utm_content", metaKey: "utmContent" },
];

export const getUTMMetadata = (url: string) => {
  const searchParams = new URLSearchParams(url);

  const metadata: Metadata[] = [];

  UTM_METADATA_KEYS.forEach(({ urlKey, metaKey }) => {
    const value = searchParams.get(urlKey);
    if (value) {
      metadata.push({ key: metaKey, value });
    }
  });

  return metadata;
};
