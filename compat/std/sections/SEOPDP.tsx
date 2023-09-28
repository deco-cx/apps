import SEO, {
  Props as SEOPDPProps,
} from "../../../commerce/sections/Seo/SeoPDP.tsx";
import { ProductDetailsPage } from "../../../commerce/types.ts";

export interface Props extends Omit<SEOPDPProps, "jsonLD"> {
  page: ProductDetailsPage | null;
}

/**
 * @deprecated true
 */
export default function SEOPDP(props: Props) {
  return (
    <SEO
      {...props}
      jsonLD={props?.page ?? (props as unknown as SEOPDPProps)?.jsonLD}
    />
  );
}
