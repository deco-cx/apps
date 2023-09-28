import SEO, {
  Props as SEOPLPProps,
} from "../../../commerce/sections/Seo/SeoPLP.tsx";

export type JsonLD = SEOPLPProps["jsonLD"];
export interface Props extends Omit<SEOPLPProps, "jsonLD"> {
  page: SEOPLPProps["jsonLD"];
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
