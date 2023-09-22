<h1>
  <p align="center">
    <a href="https://typesense.org/">
      <img alt="Typesense" src="https://github.com/deco-cx/apps/assets/1753396/616062d6-3b23-4af0-bda9-1480a90c1fa1" width="250" />
    </a>
  </p>
</h1>

<p align="center">
  <strong>
    Lightning-fast, Open Source Search. No PhD required.
  </strong>
</p>
<p align="center">
  Loaders, actions and workflows for adding Typesense search, a typo-tolerant open source search engine, to your deco.cx website.
</p>

<p align="center">
Typesense is a general purpose indexer. This means you can save any Json document and later retrieve it using the Search API. Although being a simpler solution than competing alternatives like Elastic Search or Solar, setting up an index on Typesense still requires some software engineering, like setting up searchable fields, facet fields and sorting indices. Hopefully, deco.cx introduces canonical types, like Product, ProductGroup, etc. These schemas allow this app to built solutions for common use-cases, like indexing Products for a Product Listing Page. 
</p>

# Installation
1. Install via decohub
2. Copy & Paste your Typesense instance url and keys

## Integrating to Typesense
This App uses deco.cx canonical types in a push-based architecture. This means anyone interested in indexing any supported canonical type just need to invoke the right workflow passing the right input payload. Below you can see the schematics of how ecommerce platforms use the `workflows/index/product.ts` workflow for indexing products
<img width="1080" alt="image" src="https://github.com/deco-cx/apps/assets/1753396/8c2e46cc-4886-499d-bcb0-634bdf4b750b">

As you can see, this App already receives the `Product` as input parameter, so it's up to the ecommerce platform integration to invoke the workflow. 
If you want to use Typesense with a supported ecommerce platform (VTEX, VNDA, Wake etc), install the ecommerce platform app and register Typesense workflow to listen to product events.
If you want to implement a new platform integration, you can base yourself on existing trigger implementation at vtex/workflows/events.ts

### VTEX Integration
To integrate with VTEX:

0. Open your admin at deco.cx
0. Under Blocks > Apps, make sure both vtex and Typesense apps are installed
0. Connect a product update event from vtex into Typesense. For this:
0. 0. Under Blocks > Workflows -> events.ts open your vtex-trigger block. 
0. 0. Connect `Product` event from vtex into Typesense by clicking on `+ Add Product` and selecting `Typesense Integration - Product Event` 
0. 0. Save & Publish 

<img width="395" alt="image" src="https://github.com/deco-cx/apps/assets/1753396/a135d789-50f9-415f-bbd2-a328c3762034">

🎉 Your setup is complete! You should now be able to see the products being indexed on Typesense.

After indexing is complete, you can open your Pages at deco.cx and change loaders to Typesense Loaders
