<p align="center">
  <strong>
    WooCommerce Integration for Your E-Commerce Solution
  </strong>
</p>
<p align="center">
  Loaders, actions, and workflows for integrating WooCommerce into your deco.cx website.
</p>

<p align="center">
WooCommerce is a powerful, customizable e-commerce platform built on WordPress. It provides a robust set of tools and services for businesses to establish and manage their online stores with ease.

This app wraps the WooCommerce API into a comprehensive set of loaders/actions/workflows,
enabling non-technical users to interact with and manage their headless commerce solution efficiently.
</p>

# Installation

1. Install via DecoHub.
2. Complete the required fields:

   1. **Store URL**: Enter the URL of your WooCommerce store. For example, if your store is accessible at www.store.com, make sure to use this URL.
   2. **Consumer Key**: Obtain this from the WooCommerce settings. [Follow this guide](https://woocommerce.com/document/woocommerce-rest-api/) for instructions on generating your API keys.
   3. **Consumer Secret**: Obtain this alongside the Consumer Key from WooCommerce.

Optional Step: To use a custom search engine (such as Algolia or Typesense), you will need to provide the API Key and API Token. [Refer to this guide](https://woocommerce.com/document/woocommerce-rest-api/#authentication) for generating these credentials.

Configure WooCommerce to send updates to this app by adding Deco as an affiliate. To do this, [follow this guide](https://woocommerce.com/document/woocommerce-rest-api/#authentication) and use the following endpoint as the notification URL:
- `https://{account}.deco.site/live/invoke/woocommerce/actions/trigger.ts`

Configure the event listener in Deco. To do this:
- Open Blocks > Workflows
- Create a new instance of `events.ts` by clicking on `+`
- Name the block `woocommerce-trigger`. Note that this name is crucial and should not be altered.

🎉 Your WooCommerce setup is complete! You should now see WooCommerce loaders/actions/workflows available for your sections.

If you wish to index WooCommerce's product data into Deco, click the button below. Please be aware that this is a resource-intensive operation and may impact your page views quota.
<div style="display: flex; justify-content: center; padding: 8px">
  <form target="_blank" action="/live/invoke/workflows/actions/start.ts">
    <input style="display: none" name="props" value="eyJrZXkiOiJ3b29jb21tZXIvY29tcG9uZW50L2luZGV4LnRzIn0"/> 
    <button style="color: white; background-color: #F71963; border-radius: 4px; padding: 4px 8px">Start indexing workflow</button>
  </form>
</div>
