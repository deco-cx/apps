import Section, {
  Props as SectionHeaderProps,
} from "../components/ui/Section.tsx";
import { type LoadingFallbackProps } from "@deco/deco";

// notice that using the same types from the loaders
// it will be easier to use the data from the loaders
// on deco.cx admin

interface Props extends SectionHeaderProps {
  /**
   * @title Slug Videos
   */
  slugs: string[];
}

/**
 * @title StreamShop Stories
 */
export default function Stories({
  title = "Stories",
  cta = "See all",
  slugs = [
    "lnSWxBFj",
    "E5hUMpXl",
    "o8GbO1r7",
    "g31wys57",
    "4J8mqGAD",
    "Q41wyj80",
    "NJ6WxSZp",
    "lCx1dr89",
    "ZI2NBKS7",
    "ximkLtuV",
    "AG6Fhvn0",
    "YLohX8FM",
    "lUwLnDpx",
    "5ur2WIIU",
    "PdfbAvpP",
  ],
}: Props) {
  return (
    <>
      <Section.Container>
        <Section.Header title={title} cta={cta} />

        <div style="width: 100%; height: 100px;" class="w-full px-5 sm:px-0">
          {/* @ts-ignore */}
          <liveshop-ads-carousel
            videos-width="80px"
            height="80px"
            border-radius="50%"
            gap="25px"
            slugs-video={slugs.join(",")}
          >
            {/* @ts-ignore */}
          </liveshop-ads-carousel>
        </div>
      </Section.Container>
    </>
  );
}

export const LoadingFallback = (
  { title, cta }: LoadingFallbackProps<Props>,
) => (
  <Section.Container>
    <Section.Header title={title} cta={cta} />
    <Section.Placeholder height="471px" />;
  </Section.Container>
);
