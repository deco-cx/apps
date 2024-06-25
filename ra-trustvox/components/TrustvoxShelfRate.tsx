interface Props {
  /**
   * @ignore
   */
  productId: string;
}

export default function TrustvoxShelfRate({ productId }: Props) {
  return (
    <>
      <style type="text/css">
        {`
          .trustvox-shelf-container,
          .ts-shelf-container,
          .ts-rate {
            display: flex !important;
            align-items: center;
          }

          .ts-shelf-container .ts-shelf-rate {
            top: 0 !important;
          }
        `}
      </style>
      <div
        class="trustvox-shelf-container"
        data-trustvox-product-code={productId}
      />
    </>
  );
}
