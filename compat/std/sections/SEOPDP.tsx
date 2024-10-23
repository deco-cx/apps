import SEO, {
  Props as SEOPDPProps,
} from "../../../commerce/sections/Seo/SeoPDP.tsx";
import { ProductDetailsPage } from "../../../commerce/types.ts";
import { Props as SeoProps } from "../../../website/components/Seo.tsx";

export interface Props extends Partial<Omit<SeoProps, "jsonLDs">> {
  page: ProductDetailsPage | null;
}

/**
 * @deprecated true
 * @migrate commerce/sections/Seo/SeoPDPV2.tsx
 */
export default function SEOPDP(props: Props) {
  return (
    <SEO
      {...props}
      jsonLD={props?.page ?? (props as unknown as SEOPDPProps)?.jsonLD}
    />
  );
}
