The search and recommendation system that enhances the experience in your online store.

Loaders and actions for adding SmartHint to your website.

SmartHint is an e-commerce search and recommendation system that uses artificial intelligence to elevate the online shopping experience.

It consists of smart search, pages of departments/categories and recommendation showcases.

To access the SmartHint account data or register, go to the [admin panel](https://admin.smarthint.co/)

## Installation

- Install via decohub
- Fill the necessary fields:
  - shcode
  - cluster
  - Public store URL
- Fill the optional fields (If you will use SmartHint to load category page results)
  - Category Tree (You can use a your platform category loader or fill it manually)

🎉 Your SmartHint setup is complete. You should now see SmartHint
loaders/actions available for your sections.

## Admin setup

<details>
  <summary>Admin setup</summary>
  <ul> 
    <li>1. Add SmarthintTracking section on Global Section in your site configs</li>
    <li>2. Configure autocomplete/search on pages that has a searchbar</li>
    <li>3. Configure the SearchResult and Seo section on your Search/Hotsite/Category pages</li>
  </ul>
</details>


## Dev setup

<details>
  <summary>Dev setup</summary>
  <ul> 
    <li>1. Create a section that receive <code>SmarthintRecommendation[] | null</code> and render your Shelf Sections</li>
    <li>2. Create a section that receive <code>Banner[] | null</code> To render Search/Hotsite/Category banners</li>
    <li>3. If your store use the <code>useAutocomplete</code> as search function, change to the SmartHint one</li>
    <li>4. Call the <code>&lt;SmarthintSendEventOnClick></code> on your Product Card component on SmartHint shelves or SmartHint Search/Hotsite/Category pages
      <ul>
        <details>
          <summary>Analytics Props</summary>
          <ul>
            <li>id: the product card element id</li>
            <li>event: 
              <pre>
                {
                  position // the index of product on Shelf/SearchResult,
                  productGroupID // the product group id,
                  productPrice // the product price,
                  clickProduct // the url of product,
                  clickFeature // the recommendation name (nameRecommendation) or SearchWithResult if a category/search/hotsite page,
                  positionRecommendation // the position of recommendation (position) or '0' if category/search/hotsite page,
                }
              </pre>
            </li>
          </ul>
        </details>
      </ul>
    </li>
  </ul>
</details>



