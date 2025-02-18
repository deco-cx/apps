import { Head } from "$fresh/runtime.ts";

const Script = () => {
    return (
      <>
        {/* Include Icons and manifest */}
        <Head>
  
          <script
            async
            src="https://assets.streamshop.com.br/sdk-ads/liveshop-ads-video.min.js"
          >
          </script>
          <script
            async
            src="https://assets.streamshop.com.br/sdk-ads/liveshop-ads-carousel.min.js"
          >
          </script>
          <script
            async
            src="https://assets.streamshop.com.br/sdk/liveshop-web-sdk.min.js"
          >
          </script>
        </Head>
      </>
    );
  };

export default Script
