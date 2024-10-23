import { ProductDetailsPage } from "../../commerce/types.ts";
import { toPowerReviewId } from "../utils/tranform.ts";

export interface Props {
  page: ProductDetailsPage | null;
  /**
   * @title Prop Id
   * @description Which prop in your product is your power review id?
   */
  propId?: "id" | "sku" | "model";
  /**
   * @title App Key
   * @ignore
   */
  appKey?: string;
  /**
   * @title Locale
   * @ignore
   */
  locale?: string;
  /**
   * @title Merchant Id
   * @ignore
   */
  merchantId?: string;
  /**
   * @title Merchant Group
   * @ignore
   */
  merchantGroup?: string;
}

export default function Question(
  { appKey, locale, merchantId, merchantGroup, page, propId }: Props,
) {
  if (!page) {
    return null;
  }

  const id = toPowerReviewId(propId, page?.product);

  return (
    <div>
      <div id="pr-questiondisplay" class="container px-4 max-w-[600px]"></div>
      <script src="https://ui.powerreviews.com/stable/4.1/ui.js" async></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
           window.pwr = window.pwr || function () {
            (pwr.q = pwr.q || []).push(arguments); 
           };
           pwr("render", {
            api_key: '${appKey}',
            locale: '${locale}',
            merchant_group_id: '${merchantGroup}',
            merchant_id: '${merchantId}',
             page_id: '${id}',
             review_wrapper_url: 'WRAPPER_URL',
             components: {

                QuestionDisplay:'pr-questiondisplay'
             }
          });  
        `,
        }}
      >
      </script>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .pr-qa-display-ask-question{
                padding-left: 0px;
            }
        `,
        }}
      >
      </style>
    </div>
  );
}
