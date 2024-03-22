import {
  Answer,
  Filter,
  FilterToggleValue,
  ItemAvailability,
  Product,
  ProductGroup,
  ProductLeaf,
  PropertyValue,
  Question,
  UnitPriceSpecification,
} from "../../commerce/types.ts";
import {
  Breadcrumb,
  ConteudoMidias,
  Detalhes,
  ValorSimples,
  WapProductDatiled,
  WapProduto,
} from "../utils/type.ts";
import { DEFAULT_IMAGE } from "../../commerce/utils/constants.ts";

export const getUrl = (link: string, origin: string) => {
  return new URL(link, origin);
};

export const toBreadcrumbList = (
  breadcrumbs: Breadcrumb[],
  baseUrl: string,
) => {
  return breadcrumbs.slice(1).map((breadcrumb, index) => (
    {
      "@type": "ListItem" as const,
      item: getUrl(new URL(breadcrumb.url).pathname, baseUrl).href,
      name: breadcrumb.label,
      position: index,
    }
  ));
};

export const getProductStatus = (
  status: WapProduto["status"],
  estoque: number,
): ItemAvailability => {
  if (status === "disponivel" && estoque > 1) {
    return "https://schema.org/InStock";
  }
  if (status === "sobConsulta") return "https://schema.org/PreOrder";

  return "https://schema.org/OutOfStock";
};

export const getPrices = (
  precos: WapProduto["precos"] | WapProductDatiled["precos"],
) => {
  const priceSpecification: UnitPriceSpecification[] = [];

  if (precos?.parcelamento) {
    precos.parcelamento.forEach((installmentPlan) => {
      if (!installmentPlan) return null;

      priceSpecification.push({
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        priceComponentType: "https://schema.org/Installment",
        billingDuration: installmentPlan?.parcelas,
        billingIncrement: installmentPlan?.valorParcela,
        price: installmentPlan.valorTotal,
      });
    });
  }

  if (precos.de) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/ListPrice",
      price: precos.de,
    });
  }
  if (precos.por) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/SalePrice",
      price: precos.por,
    });
  }
  if (precos.vista) {
    priceSpecification.push({
      "@type": "UnitPriceSpecification",
      priceType: "https://schema.org/MinimumAdvertisedPrice",
      price: precos.vista,
    });
  }

  return priceSpecification;
};

export const toOffers = (
  i: WapProduto | WapProductDatiled | ValorSimples,
  status: WapProduto["status"],
) => {
  return {
    "@type": "AggregateOffer" as const,
    highPrice: i.precos.por ?? null,
    lowPrice: i.precos.vista ?? null,
    priceCurrency: "BRL",
    offerCount: 1,
    offers: [{
      "@type": "Offer" as const,
      price: i.precos.por,
      availability: getProductStatus(status, i.estoque),
      inventoryLevel: {
        value: i.estoque,
      },
      priceSpecification: getPrices(i.precos),
    }],
  };
};

export const toProduct = (
  product: WapProduto | WapProductDatiled,
  baseUrl: string,
): Product => {
  const additionalProperty: PropertyValue[] = [];

  Object.entries(product.descricoes).forEach(([key, value]) => {
    if (!value) return;

    additionalProperty.push({
      "@type": "PropertyValue",
      name: key,
      value,
      valueReference: "DESCRICOES",
    });
  });

  if ((product as WapProductDatiled)?.assinatura) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "assinatura",
      value: String((product as WapProductDatiled).assinatura),
      valueReference: "PROPERTY",
    });
  }

  if ((product as WapProductDatiled)?.video) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "video",
      value: (product as WapProductDatiled)?.video?.url,
      description: (product as WapProductDatiled).video?.plataforma,
      valueReference: "PROPERTY",
    });
  }

  (product.midias as ConteudoMidias)?.arquivos?.map((arquivo) => {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: arquivo.label,
      value: arquivo.arquivo,
      valueReference: "MIDIAS_ARQUIVOS",
      identifier: String(arquivo.id),
      description: arquivo.descricao,
    });
  });

  (product.midias as ConteudoMidias)?.manuais?.map((manual) => {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: manual.label,
      value: manual.arquivo,
      valueReference: "MIDIAS_MANUAIS",
      identifier: String(manual.id),
      description: manual.descricao,
    });
  });

  product?.selos?.forEach((selo) => {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: selo.nome,
      value: selo.label,
      valueReference: "SELOS",
      image: [{
        "@type": "ImageObject",
        url: selo.imagem,
      }],
    });
  });

  if (product?.filtros) {
    product?.filtros.forEach((filtro) => {
      additionalProperty.push({
        "@type": "PropertyValue",
        name: filtro.nome,
        value: filtro.label,
        identifier: String(filtro.idFiltro),
        valueReference: "FILTROS",
        image: [{
          "@type": "ImageObject",
          url: filtro.imagem,
        }],
      });
    });
  }

  const sku = new URL(baseUrl).searchParams.get("sku");

  const images = product.midias.imagens.map((image) => ({
    "@type": "ImageObject" as const,
    name: image.label,
    description: image.descricao,
    url: image.arquivos.big ?? "",
  }));

  const hasVariant: ProductLeaf[] = (product as WapProductDatiled).atributos
    ?.simples?.valores.map((v) => ({
      "@type": "Product",
      productID: product.id.toString(),
      sku: v.sku,
      offers: toOffers(v, product.status),
      name: product.nome,
      url: `${
        getUrl(`/${product.rota.params.produto}`, baseUrl).href
      }.html?sku=${v.sku}`,
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: (product as WapProductDatiled).atributos?.simples.nome,
          value: v.label,
          propertyID: String(v.idAtributoValor),
          image: [{ "@type": "ImageObject", name: "imagem", url: v.imagem }, {
            "@type": "ImageObject",
            name: "imagemOriginal",
            url: v.imagemOriginal,
          }],
          valueReference: "ATRIBUTO SIMPLES",
        },
      ],
    })) ?? [];

  (product as WapProductDatiled).atributos
    ?.unico?.valores.forEach((v) => {
      hasVariant.push({
        "@type": "Product",
        productID: product.id.toString(),
        sku: product.sku,
        offers: toOffers(product, product.status),
        name: product.nome,
        url: `${
          getUrl(`/${product.rota.params.produto}`, baseUrl).href
        }.html?sku=${product.sku}`,
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: (product as WapProductDatiled).atributos?.unico.nome,
            value: v.label,
            propertyID: String(v.idAtributoValor),
            image: [{ "@type": "ImageObject", name: "imagem", url: v.imagem }, {
              "@type": "ImageObject",
              name: "imagemOriginal",
              url: v.imagemOriginal,
            }],
            valueReference: "ATRIBUTO UNICO",
          },
        ],
      });
    });

  const selected = hasVariant.find((i) => i.sku == sku) ?? hasVariant[0];

  const isVariantOf: ProductGroup = {
    "@type": "ProductGroup",
    hasVariant,
    productGroupID: product.id.toString(),
    additionalProperty,
  };

  return {
    // @ts-ignore its necessary to product without any variation spec
    productID: product.id.toString(),
    name: product.nome,
    description: product.descricoes.longa,
    brand: {
      "@type": "Brand",
      identifier: product.marca.id.toString(),
      name: product.marca.nome,
      logo: product.marca.imagem,
      url: new URL(product.marca.rota.path, baseUrl).href,
    },
    url: `${getUrl(`/${product.rota.params.produto}`, baseUrl).href}.html`,
    image: images.length ? images : [DEFAULT_IMAGE],
    category: (product as WapProductDatiled)?.categoria?.nome,
    isVariantOf,
    aggregateRating: product.avaliacao.quantidade > 0
      ? {
        "@type": "AggregateRating",
        ratingValue: product.avaliacao.media,
        ratingCount: product.avaliacao.quantidade,
        reviewCount: product.avaliacao.avaliacoes?.length,
      }
      : undefined,
    review: product.avaliacao.avaliacoes?.map((avaliacao) => ({
      "@type": "Review",
      // "@id": avaliacao.id,
      author: [{
        "@type": "Author",
        name: avaliacao.nome,
        identifier: avaliacao.email,
      }],
      reviewBody: avaliacao?.comentario,
      datePublished: avaliacao?.data,
      itemReviewed: String(avaliacao?.produto?.id),
      reviewRating: {
        "@type": "AggregateRating",
        ratingValue: avaliacao.nota,
        ratingCount: 1,
        bestRating: 5,
        worstRating: 1,
      },
      // TODO PARSE RATING MEDIA
      // media: avaliacao.anexos.map((anexo: unknown) => ({})),
    })),

    offers: toOffers(product, product.status),
    isRelatedTo: (product as WapProductDatiled).combinacoes?.map((
      combinacao,
    ) => toProduct(combinacao.produto, baseUrl)),
    questions: (product as WapProductDatiled).perguntas?.map((
      pergunta,
    ): Question => ({
      "@type": "Question",
      answerCount: pergunta.respostas.length,
      name: pergunta.pergunta,
      text: pergunta.pergunta,
      datePublished: pergunta.data,
      suggestedAnswer: pergunta.respostas.map((resposta): Answer => (
        {
          datePublished: resposta.data,
          text: resposta.resposta,
          author: [{
            "@type": "Author",
            identifier: resposta.email,
            name: resposta.nome,
          }],
        }
      )),
      author: [{
        "@type": "Author",
        identifier: pergunta.email,
        name: pergunta.nome,
      }],
    })),
    ...selected,
  };
};

export const toFilter = (
  filtro: {
    nome: string;
    valores: Array<
      { label?: string; nome?: string; url: string; ativo: boolean }
    >;
  },
  baseUrl: string,
): Filter | null => {
  if (!filtro.valores.length) return null;

  return {
    "@type": "FilterToggle",
    key: filtro.nome,
    label: filtro.nome,
    quantity: filtro.valores?.length ?? 0,
    values: filtro.valores?.map((filterItem): FilterToggleValue => {
      const filterURL = new URL(baseUrl);
      filterURL.pathname = new URL(filterItem.url).pathname;
      filterURL.search = new URL(filterItem.url).search;

      return {
        quantity: 0,
        value: filterItem.label ?? filterItem.nome ?? "",
        label: filterItem.label ?? filterItem.nome ?? "",
        selected: filterItem.ativo,
        url: filterURL.href,
      };
    }) ?? [],
  };
};

export const toFilters = (
  details: Detalhes,
  baseUrl: string,
): Filter[] => {
  const filters = [];

  const fromFiltros = details.filtros.map((filtro) =>
    toFilter(filtro, baseUrl)
  );

  const fromMarcas = toFilter({
    nome: "marca",
    valores: details.marcas,
  }, baseUrl);

  const fromAttributes = details.atributos.map((filtro) =>
    toFilter(filtro, baseUrl)
  );

  const fromPrecos = toFilter({
    nome: "preco",
    valores: details.filtrosPreco.map((i) => ({
      nome: `${i.de}-${i.ate}`,
      ...i,
    })),
  }, baseUrl);

  const fromDescontoPrecoPor = toFilter({
    nome: "Desconto Preco Por",
    valores: Object.values(details.filtrosDescontoPrecoPor).map((i) => ({
      nome: `${i.de}-${i.ate}`,
      ...i,
    })),
  }, baseUrl);

  filters.push(
    ...fromFiltros,
    fromMarcas,
    ...fromAttributes,
    fromPrecos,
    fromDescontoPrecoPor,
  );

  return filters.filter((f): f is Filter => Boolean(f));
};
