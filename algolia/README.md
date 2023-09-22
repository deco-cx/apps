<p align="center">
  <a href="https://www.gatsbyjs.com">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Algolia
</h1>

<p align="center">
  <strong>
    The future of web development is here.
  </strong>
</p>
<p align="center">
  Gatsby is a free and open source framework based on React that helps developers build blazing fast websites and apps. </br> It combines the control and scalability of dynamically rendered sites with the speed of static-site generation, creating a whole new web of possibilities.
</p>
<p align="center">
  <a href="https://github.com/gatsbyjs/gatsby/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Gatsby is released under the MIT license." />
  </a>
  <a href="https://circleci.com/gh/gatsbyjs/gatsby">
    <img src="https://circleci.com/gh/gatsbyjs/gatsby.svg?style=shield" alt="Current CircleCI build status." />
  </a>
  <a href="https://www.npmjs.com/package/gatsby">
    <img src="https://img.shields.io/npm/v/gatsby.svg" alt="Current npm package version." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dm/gatsby.svg" alt="Downloads per month on npm." />
  </a>
  <a href="https://npmcharts.com/compare/gatsby?minimal=true">
    <img src="https://img.shields.io/npm/dt/gatsby.svg" alt="Total downloads on npm." />
  </a>
  <a href="https://gatsbyjs.com/contributing/how-to-contribute/">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
  <a href="https://twitter.com/intent/follow?screen_name=gatsbyjs">
    <img src="https://img.shields.io/twitter/follow/gatsbyjs.svg?label=Follow%20@gatsbyjs" alt="Follow @GatsbyJS" />
  </a>
</p>

# Algolia search integration
Loaders, actions and workflows for adding agolia search to your deco.cx website

# Installation
1. Install via decohub
2. Open your Algolia dashboard and grab your keys at settings > API Keys
3. Copy & Paste your Application ID and Admin API Key

> Use `Admin API Key` instead of `Search-Only API Key` since this app tweaks search params and create/deletes records

# Description
Algolia is a general purpose indexer. This means you can save any Json document and later retrieve it using the Search API. Although being a simpler solution than competing alternatives like Elastic Search or Solar, setting up an index on Algolia still requires some software engineering, like setting up searchable fields, facet fields and sorting indices. Hopefully, deco.cx introduces canonical types, like Product, ProductGroup, etc. These schemas allow this app to built solutions for common use-cases, like indexing Products for a Product Listing Page. 

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
