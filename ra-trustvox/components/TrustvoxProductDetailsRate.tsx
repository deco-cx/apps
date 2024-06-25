interface Props {
  /**
   * @ignore
   */
  productId: string;
}

export default function TrustvoxProductDetailsRate({ productId }: Props) {
  return (
    <>
      <style type="text/css">
        {`
          .trustvox-widget-rating,
          .trustvox-widget-rating .ts-shelf-container,
          .trustvox-widget-rating .trustvox-shelf-container,
          .trustvox-widget-rating .ts-rate {
            display: flex;
            align-items: center;
          }

          .trustvox-widget-rating span.rating-click-here {
            display: flex;
            color: #DAA81D;
          }

          .trustvox-widget-rating:hover span.rating-click-here {
            text-decoration: underline;
          }

          .ts-shelf-container .ts-shelf-rate {
            top: 0 !important;
          }
        `}
      </style>
      <a
        class="trustvox-fluid-jump trustvox-widget-rating"
        href="#trustvox-reviews"
        title="Pergunte e veja opiniões de quem já comprou"
      >
        <div
          class="trustvox-shelf-container"
          data-trustvox-product-code-js={productId}
          data-trustvox-should-skip-filter="true"
          data-trustvox-display-rate-schema="true"
        />
        <span class="rating-click-here">Clique e veja!</span>
      </a>
    </>
  );
}
