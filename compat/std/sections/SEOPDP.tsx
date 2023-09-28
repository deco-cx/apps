import SEO, {
    Props as SEOPDPProps,
} from "../../../commerce/sections/Seo/SeoPDP.tsx";

export type JsonLD = SEOPDPProps["jsonLD"];
export interface Props extends Omit<SEOPDPProps, "jsonLD"> {
  page: SEOPDPProps["jsonLD"];
}

/**
 * @deprecated true
 */
export default function SEOPDP(props: Props) {
  return (
    <SEO {...props} jsonLD={props?.page ?? (props as unknown as SEOPDPProps)?.jsonLD} />
  );
}
