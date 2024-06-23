<h1>
  <p align="center">
    <a href="https://www.smarthint.co/">
      <img alt="Smarthint" src="https://raw.githubusercontent.com/IncognitaDev/apps/smarthint/smarthint/logo.png" width="125" />
    </a>
  </p>
</h1>

<p align="center">
  <strong>
    The search and recommendation system that enhances the experience in your online store.
  </strong>
</p>
<p align="center">
  Loaders and actions for adding Smarthint to your website.
</p>

<p align="center">
Through artificial intelligence, data analysis, and consumer behavior within the online store, our technology identifies interests and personalizes the entire online experience for users, enhancing factors such as competitiveness, customer loyalty, and sales growth.
  
This app wraps Smarthint API into a comprehensive set of loaders/actions
empowering non technical users to interact and act upon their headless commerce.

</p>

## Installation

1. Install via decohub
2. Fill the necessary fields:
  - shcode
  - cluster

🎉 Your Smarthint setup is complete. You should now see Smarthint
loaders/actions available for your sections.

## Admin setup

<details>
  <summary>Admin setup</summary>
  <ul> 
    <li>3. Add SmarthintTracking section on Global Section in your site configs</li>
    <li>4. Configure autocomplete/search on pages that has a searchbar</li>
    <li>5. Configure the SearchResult and Seo section on your Search/Hotsite/Category pages</li>
  </ul>
</details>


## Dev setup

<details>
  <summary>Dev setup</summary>
  <ul> 
    <li>1. Create a section that receive <code>SmarthintRecommendation[] | null</code> and render your Shelf Sections</li>
    <li>2. Create a section that receive <code>Banner[] | null</code> To render Search/Hotsite/Category banners</li>
    <li>3. If your store use the <code>useAutocomplete</code> as search function, change to the smarthint one</li>
    <li>4. Call the <code>&lt;SmarthintSendEventOnClick></code> on your Product Card component on Smarthint shelves or Smarthint Search/Hotsite/Category pages
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



