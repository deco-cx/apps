import SEO, {
  Props as SEOPLPProps,
} from "../../../commerce/sections/Seo/SeoPLP.tsx";
import { ProductListingPage } from "../../../commerce/types.ts";

export interface Props extends Omit<SEOPLPProps, "jsonLD"> {
  page: ProductListingPage | null;
}

/**
 * @deprecated true
 */
export default function SEOPLP(props: Props) {
  return (
    <SEO
      {...props}
      jsonLD={props?.page ?? (props as unknown as SEOPLPProps)?.jsonLD}
    />
  );
}
