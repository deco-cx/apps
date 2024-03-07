import SEO, {
  Props as SEOPLPProps,
} from "../../../commerce/sections/Seo/SeoPLP.tsx";
import { Props as SeoProps } from "../../../website/components/Seo.tsx";

import { ProductListingPage } from "../../../commerce/types.ts";

export interface Props extends Partial<Omit<SeoProps, "jsonLDs">> {
  page: ProductListingPage | null;
}

/**
 * @deprecated true
 * @migrate commerce/sections/Seo/SeoPLPV2.tsx
 */
export default function SEOPLP(props: Props) {
  return (
    <SEO
      {...props}
      jsonLD={props?.page ?? (props as unknown as SEOPLPProps)?.jsonLD}
    />
  );
}
