<hr/>

<a href="https://deco.cx/discord" target="_blank"><img alt="Discord" src="https://img.shields.io/discord/985687648595243068?label=Discord&color=7289da" /></a>
&nbsp;
<a href="https://x.com/deco_frontend" target="_blank"><img src="https://img.shields.io/twitter/follow/deco_frontend" alt="Deco Twitter" /></a>
&nbsp;
![Build Status](https://github.com/deco-cx/apps/workflows/ci/badge.svg?event=push&branch=main)

<hr/>

# Deco Standard **Apps** Library

<img align="right" src="/assets/logo.svg" height="150px" alt="The Deco Framework logo: A capybara in its natural habitat">

Welcome to the `deco-cx/apps` repository! This repository is home to a collection of powerful apps that can be seamlessly integrated into your deco sites. Here, we provide you with a brief overview of the deco framework and introduce the concept of apps. We'll also delve into the repository structure, how to contribute, and more. Read more about apps in the [docs](https://www.deco.cx/docs/en/concepts/app), also if you want to see apps in action check our [storefront](https://github.com/deco-sites/storefront) repository.

## About the deco Framework

Deco, formerly known as `live`, is a modern and versatile framework that empowers developers to build dynamic and interactive websites with ease. Apps are a fundamental component of deco, offering a way to bundle sets of blocks together, all configured through an intuitive UI and sharing a common state defined within the app module.

## Repository Structure

The `deco-cx/apps` repository is structured as a monorepo, housing a collection of individual apps, each stored in a dedicated subfolder. These apps can be installed separately, providing you with the flexibility to choose and integrate only the functionalities that suit your project's needs.

The `deco.ts` file serves as a hub where you can specify the apps of this repository. However it is important to notice that whether you choose to create apps within this repository or within your own organization's repository, there are no limitations on where apps should be developed.

## Overview

At the core of all websites within this repository is the `website` app, located in the `website` folder. This app lays the foundation for websites, offering a set of common features that are essential regardless of whether your site is an e-commerce platform or not. We've also structured the repository to accommodate specific platforms, such as e-commerce platforms like VTEX, Shopify, VNDA, and more. These platform-specific apps depend on the `website` app, leveraging its shared features while adding platform-specific functionality.

## Contributing

Check [CONTRIBUTING.md](https://github.com/deco-cx/apps/blob/main/CONTRIBUTING.md)

### Apps

| App Name         | Description                                                                                                                                                                           | Manifest                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Algolia          | Algolia search integration. Provides loaders and workflows for searching and indexing on Algolia                                                                                      | [manifest](/algolia/manifest.gen.ts)          |
| ai-assistant     | AI Assistant is a hub for artificial intelligence (AI) assistants, allowing you to register your own AI assistants and invoke them through automated actions.                         | [manifest](/ai-assistant/manifest.gen.ts)     |
| analytics        | Analytics is a powerful data analysis tool, providing valuable insights into the performance and behavior of users on your application or platform.                                   | [manifest](/analytics/manifest.gen.ts)        |
| brand-assistant  | Brand Assistant is a brand assistance tool.                                                                                                                                           | [manifest](/brand-assistant/manifest.gen.ts)  |
| commerce         | A simple configurable start for any e-commerce platform, lets you switch between any of those                                                                                         | [manifest](/commerce/manifest.gen.ts)         |
| $live            | An app for compatibility with $live blocks.                                                                                                                                           | [manifest](/compat/$live/manifest.gen.ts)     |
| deco-sites/std   | An app for compatibility with deco-sites/std app, contains various blocks merged from e-commerce apps.                                                                                | [manifest](/compat/std/manifest.gen.ts)       |
| decohub          | The best place to find an app for your business case, here is where apps published by any developer in the deco ecosystem will live.                                                  | [manifest](/decohub/manifest.gen.ts)          |
| implementation   | App for project implementation details.                                                                                                                                               | [manifest](/implementation/manifest.gen.ts)   |
| Konfidency       | An app that uses extension block to add Aggregate Rating to products by integrating with the "[Konfidency](https://www.konfidency.com.br/)" provider.                                 | [manifest](/konfidency/manifest.gen.ts)       |
| Linx             | The app for e-commerce that uses Linx as a platform.                                                                                                                                  | [manifest](/linx/manifest.gen.ts)             |
| nuvemshop        | The app for e-commerce that uses Nuvemshop as a platform.                                                                                                                             | [manifest](/nuvemshop/manifest.gen.ts)        |
| openai           | Connects to OpenAI services to generate AI-powered content.                                                                                                                           | [manifest](/openai/manifest.gen.ts)           |
| power-reviews    | Power Reviews is an integration to show reviews and ratings of your products. It allow your customers to give a rating, write texts, emphasis pros/cons and upload images and videos. | [manifest](/power-reviews/manifest.gen.ts)    |
| Resend           | App for sending emails using [https://resend.com/](https://resend.com/)                                                                                                               | [manifest](/resend/manifest.gen.ts)           |
| EmailJS          | App for sending emails using [https://www.emailjs.com/](https://www.emailjs.com/)                                                                                                     | [manifest](/emailjs/manifest.gen.ts)          |
| Shopify          | The app for e-commerce that uses Shopify as a platform.                                                                                                                               | [manifest](/shopify/manifest.gen.ts)          |
| sourei           | Digitalize your business with Sourei. Offering a wide range of digital solutions, from domain registration to advanced project infrastructure.                                        | [manifest](/sourei/manifest.gen.ts)           |
| typesense        | Typesense search integration. Provides loaders and workflows for searching and indexing on Typesense.                                                                                 | [manifest](/typesense/manifest.gen.ts)        |
| Verified Reviews | An app that uses extension block to add Aggregate Rating to products by integrating with the "[Opiniões Verificadas](https://www.opinioes-verificadas.com.br/br/)" provider.          | [manifest](/verified-reviews/manifest.gen.ts) |
| VNDA             | The app for e-commerce that uses VNDA as a platform.                                                                                                                                  | [manifest](/vnda/manifest.gen.ts)             |
| VTEX             | The app for e-commerce that uses VTEX as a platform.                                                                                                                                  | [manifest](/vtex/manifest.gen.ts)             |
| Wake             | The app for e-commerce that uses Wake as a platform.                                                                                                                                  | [manifest](/wake/manifest.gen.ts)             |
| Weather          | Weather is an application that provides accurate and up-to-date weather information.                                                                                                  | [manifest](/weather/manifest.gen.ts)          |
| Website          | The base app of any website. Contains `Page.tsx` block and other common loaders like image and fonts.                                                                                 | [manifest](/website/manifest.gen.ts)          |
| Workflows        | App for managing workflows.                                                                                                                                                           | [manifest](/workflows/manifest.gen.ts)        |

## E-commerce Integrations - Status

| Integrations                                                                                               | Home | PLP | PDP | Cart | Checkout proxy | Order placed proxy | My account proxy |
| :--------------------------------------------------------------------------------------------------------- | :--- | :-- | :-- | :--- | :------------- | :----------------- | :--------------- |
| [VTEX](https://github.com/deco-cx/apps/blob/main/vtex/README.md)                                           | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ✅               |
| [VNDA](https://github.com/deco-cx/apps/blob/main/vnda/README.md)                                           | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ✅               |
| [Shopify](https://github.com/deco-cx/apps/blob/b072c1fdfab8d5f1647ed42f9dbaae618f28f05f/shopify/README.md) | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ⚠️               |
| [Linx](https://github.com/deco-cx/apps/blob/main/linx/README.md)                                           | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ✅               |
| Linx impulse                                                                                               | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ✅               |
| [Nuvemshop](https://github.com/deco-cx/apps/blob/main/nuvemshop/README.MD)                                 | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ⚠️               |
| [Wake](https://github.com/deco-cx/apps/blob/main/wake/README.md)                                           | ✅   | ✅  | ✅  | ✅   | ✅             | ✅                 | ✅               |

## Review Integrations - Status

| Integrations                                                                             | Extension PDP | Extension ProductList | Extension Listing Page | Submit Review |
| :--------------------------------------------------------------------------------------- | :------------ | :-------------------- | :--------------------- | :------------ |
| [Power Reviews](https://github.com/deco-cx/apps/blob/main/power-reviews/README.md)       | ✅            | ✅                    | ✅                     | ✅            |
| [Verified Reviews](https://github.com/deco-cx/apps/blob/main/verified-reviews/README.md) | ✅            | ✅                    | ✅                     | 🔴            |
| [Konfidency](https://github.com/deco-cx/apps/blob/main/konfidency/README.md)             | ✅            | 🔴                    | 🔴                     | 🔴            |

#### Adding a new app to Deco Hub

In order to make your app available to be installable in any deco site, just import/export your app inside decohub/apps folder.

## Thanks to all contributors

<a href="https://github.com/deco-cx/apps/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=deco-cx/apps" />
</a>

