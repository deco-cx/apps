export interface Props {
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

export default function WriteReviewForm(state: Props) {
  return (
    <div>
      <div id="pr-write" class="container max-w-[600px]"></div>
      <script src="https://ui.powerreviews.com/stable/4.1/ui.js" async></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.pwr = window.pwr || function () {
              (pwr.q = pwr.q || []).push(arguments); 
            };
            pwr("render", {
              api_key: '${state.appKey}',
              locale: '${state.locale}',
              merchant_group_id: '${state.merchantGroup}',
              merchant_id: '${state.merchantId}',
              on_submit:function(config, data){
                    window.scrollTo(0,0);
                    },
              components: {
                  Write: 'pr-write',
              }
            });   
          `,
        }}
      >
      </script>
    </div>
  );
}
