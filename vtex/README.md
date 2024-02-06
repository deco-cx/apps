<p align="center">
  <strong>
    VTEX Commerce Platform for B2B & B2C Ecommerce Solution
  </strong>
</p>
<p align="center">
  Loaders, actions and workflows for adding VTEX Commerce Platform to your deco.cx website.
</p>

<p align="center">
VTEX is a cloud-based e-commerce platform and digital commerce company that provides a comprehensive set of tools and services for businesses looking to establish and manage their online retail operations.

This app wrapps VTEX API into a comprehensive set of loaders/actions/workflows
empowering non technical users to interact and act upon their headless commerce.

</p>

# Installation

1. Install via decohub
2. Fill the necessary fields:

1. Account name. More info on how to retrieve this param, take a look at this
  [article](https://help.vtex.com/en/tutorial/what-is-an-account-name--i0mIGLcg3QyEy8OCicEoC?&utm_source=autocomplete)
2. Public URL: A public URL pointing to your VTEX installation. If your store is
  accessible via www.store.com, create a secure.store.com domain pointing to
  your VTEX account

Optional Step: The previous config will allow you to have a headless storefront
(home page, product details page, product listing page and cart). If you want to
use a custom search engine (Algolia, Typesense etc), you will need to fill the
App Key & App Token properties. For these, follow this
[guide](https://help.vtex.com/tutorial/application-keys--2iffYzlvvz4BDMr6WGUtet#generating-app-keys-in-your-account)

Configure VTEX to send updates to this app by adding deco as an affiliate. To do
this, follow
[this guide](https://help.vtex.com/en/tutorial/configuring-affiliates--tutorials_187?&utm_source=autocomplete)
and use the following endpoint as the notification url. -
https://{account}.deco.site/live/invoke/vtex/actions/trigger.ts

Configure the event listener at deco. For this: - Open Blocks > Workflows -
Create a new instance of `events.ts` by clicking on `+` - Create the block and
name it `vtex-trigger`. Note this name is important and should not be changed

🎉 Your VTEX setup is complete. You should now see VTEX
loaders/actions/workflows available for your sections.

If you wish to index VTEX's product data into deco, click in the button below. Beware this is a very costly operation that may influence on your page views quota
<div style="display: flex; justify-content: center; padding: 8px">
  <form target="_blank" action="/live/invoke/workflows/actions/start.ts">
    <input style="display: none" name="props" value="eyJrZXkiOiJ2dGV4L3dvcmtmbG93cy9wcm9kdWN0L2luZGV4LnRzIn0"/> 
    <button style="color: white; background-color: #F71963; border-radius: 4px; padding: 4px 8px">Start indexing workflow</button>
  </form>
</div>

