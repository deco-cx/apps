import Section, {
  Props as SectionHeaderProps,
} from "../components/ui/StreamshopSection.tsx";
import { type LoadingFallbackProps } from "@deco/deco";

interface Props extends SectionHeaderProps {
  /**
   * @title Slug da sua loja
   * @description Slug da sua loja, não de videos únicos
   */
  storeSlug?: string;

  /**
   * @title Tamanho
   */
  size?: {
    width: string;
    height: string;
  };

  /**
   * @title Texto
   * @format html
   */
  text: string;
}

/**
 * @title StreamShop Info & Stories
 */
export default function InfoStories(
  {
    title,
    cta,
    storeSlug,
    size = { width: "300px", height: "500px" },
    text = `<div class="lynx-subtitle">
<div>Video Commerce StreamShop</div>
<h2><span style="font-size: 36px; font-weight: 500; line-height: 120%;">Incorpore v&iacute;deos interativos no seu ecommerce e eleve sua taxa de convers&atilde;o!</span></h2>
<p style="font-size: 18px; font-weight: 300;">O&nbsp;Video Commerce da StreamShop &eacute; uma solu&ccedil;&atilde;o inovadora de simples implementa&ccedil;&atilde;o que eleva a experi&ecirc;ncia dos seus clientes com a sua marca.<br><br>Incorpore os v&iacute;deos que voc&ecirc; j&aacute; produz para as redes sociais &agrave;s p&aacute;ginas do seu site, oferecendo muito mais conte&uacute;do e interatividade para seus consumidores.<br>&zwj;<br><strong style="font-size: 18px; font-weight: bold;">Seu ecommerce n&atilde;o pode esperar. Assine agora!</strong></p>
</div>`,
  }: Props,
) {
  return (
    <>
      <Section.Container>
        <Section.Header title={title} cta={cta} />
        <div class="w-full flex justify-between items-start flex-col sm:flex-row gap-4 !px-5 md:!px-0">
          <div class="w-full" dangerouslySetInnerHTML={{ __html: text }}>
          </div>

          <div
            style="width: 100%"
            class="w-full px-5 sm:px-0 flex justify-center items-center"
          >
            <iframe
              class="max-md:max-w-[380px]  max-md:min-h-[675px]  aspect-[9/16]"
              style="border-radius: 16px; overflow: hidden"
              frameborder="0"
              src={storeSlug
                ? `https://lite.streamshop.com.br/${storeSlug}`
                : "https://lite.streamshop.com.br/streamshopdemo"}
              height={size.height}
              width={size.width}
              allow="fullscreen; autoplay; picture-in-picture"
            >
            </iframe>
          </div>
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
