<h1>
  <p align="center">
    <a href="https://developer.adobe.com/commerce/docs/">
      Magento
    </a>
  </p>
</h1>

<p align="center">
  <strong>
    Start and grow your e-commerce business
  </strong>
</p>
<p align="justify">
  Loaders, actions and workflows for adding Magento Commerce Platform to your deco.cx website.
</p>

<p align="justify">
Magento, by Adobe, is a PHP-based eCommerce platform offering robust customization and scalability. It features extensive API integrations and flexible product and order management. Magento supports multiple languages and currencies.
</p>

# Installation

- Install via decohub
- Fill the necessary fields

# Settings in Magento

<p align="center"><strong>To ensure the proper functioning of the loaders, follow this instructions in Magento Admin:</strong></p>

<h3><a href="https://developer.adobe.com/commerce/webapi/graphql/schema/products/queries/products/">Products Query (GraphQL)</a></h3>

- Enable "<strong>Use in Search</strong>", at least, on the following attributes: <a href="https://github.com/magento/magento2/issues/27518">See more</a>
<ul>
  <li><strong>url_key</strong></li>
  <li><strong>sku</strong></li>
  <li><strong>category_uid</strong></li>
  <li><strong>category_id</strong></li>
</ul>

- Enable "<strong>Used in Sorting in Product Listing</strong>" on the "<strong>Custom Filters</strong>" attributes. <a href="https://developer.adobe.com/commerce/webapi/graphql/schema/products/queries/products/#sort-attribute">See more</a>

<h3><a href="https://developer.adobe.com/commerce/webapi/graphql/schema/products/queries/categories/">Categories Query (GraphQL)</a></h3>

- Enable "<strong>Use in Search</strong>" on the "<strong>url_key</strong>" attribute. <a href="https://github.com/magento/magento2/issues/27518">See more</a>

<p align="center">🎉 Your Magento setup is complete.</p>
