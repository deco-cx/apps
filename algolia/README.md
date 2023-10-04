<h1>
  <p align="center">
    <a href="https://www.algolia.com/">
      <img alt="Algolia" src="https://github.com/deco-cx/apps/assets/1753396/0ff38024-1988-442d-8415-01d16055480f" width="250" />
    </a>
  </p>
</h1>

<p align="center">
  <strong>
    AI Search & Discovery platform
  </strong>
</p>
<p align="center">
  Loaders, actions and workflows for adding Agolia search, the leader in globally scalable, secure, digital search and discovery experiences that are ultrafast and reliable, to your deco.cx website.
</p>

<p align="center">
Algolia is a general purpose indexer. This means you can save any Json document and later retrieve it using the Search API. Although being a simpler solution than competing alternatives like Elastic Search or Solar, setting up an index on Algolia still requires some software engineering, like setting up searchable fields, facet fields and sorting indices. Hopefully, deco.cx introduces canonical types, like Product, ProductGroup, etc. These schemas allow this app to built solutions for common use-cases, like indexing Products for a Product Listing Page. 
</p>

# Installation
1. Install via decohub
2. Open your Algolia dashboard and grab your keys at settings > API Keys
3. Copy & Paste your Application ID and Admin API Key
4. Save & Publish this block
5. Click on the button below to setup the necessary indices on Algolia

<div style="display: flex; justify-content: center; padding: 8px">
  <form target="_blank" action="/live/invoke/algolia/actions/setup.ts" >
    <button style="color: white; background-color: #003dff; border-radius: 4px; padding: 4px 8px">Create Indices</button>
  </form>
</div>


> Use `Admin API Key` instead of `Search-Only API Key` since this app tweaks search params and create/deletes records

## Integrating to Algolia
This App uses deco.cx canonical types in a push-based architecture. This means anyone interested in indexing any supported canonical type just need to invoke the right workflow passing the right input payload. Below you can see the schematics of how ecommerce platforms use the `workflows/index/product.ts` workflow for indexing products
<img width="1073" alt="Screenshot 2023-09-20 at 17 44 33" src="https://github.com/deco-cx/apps/assets/1753396/e4d9e795-e35c-4206-a628-4aa7f72f904b">

As you can see, this App already receives the `Product` as input parameter, so it's up to the ecommerce platform integration to invoke the workflow. 
If you want to use Algolia with a supported ecommerce platform (VTEX, VNDA, Wake etc), install the ecommerce platform app and register Algolia workflow to listen to product events.
If you want to implement a new platform integration, you can base yourself on existing trigger implementation at VTEX/workflows/events.ts

### VTEX Integration
To integrate with VTEX:

1. Open your admin at deco.cx
2. Under Blocks > Apps, make sure both VTEX and Algolia apps are installed
3. Connect a product update event from VTEX into Algolia. For this:
0. 1. Under Blocks > Workflows -> events.ts open your VTEX-trigger block. 
0. 2. Connect `Product` event from VTEX into Algolia by clicking on `+ Add Product` and selecting `Algolia Integration - Product Event` 
0. 3. Save & Publish 

<img width="395" alt="image" src="https://github.com/deco-cx/apps/assets/1753396/a135d789-50f9-415f-bbd2-a328c3762034">

🎉 Your setup is complete! You should now be able to see the products being indexed on Algolia.

After indexing is complete, you can open your Pages at deco.cx and change loaders to Algolia Loaders
