# Power Reviews Integration

# Installation

1. Install via decohub
2. Fill props: appKey and MerchantId

# Description

Power Reviews is an integration to show reviews and ratings of your products. It
allow your customers to give a rating, write texts, emphasis pros/cons and
upload images and videos.

# Extensions

In this integration, there are three extensions that you can use in your store:
ProductDetailsPage, ProductList and ProductListingPage.

If your section expect the same prop that one of this loaders give. You will
have an option at deco called Extend your product. Select this and then you can
receive your product as normal, but with Reviews and Ratings by Power Revies.

# Loaders

**review.ts:** Loader that return Review and Rating information based on pageId.
If you need to pagination your review results, that is a good option.

**reviewForm.ts** Loader that return your Form Review fields/information. Use
that to do a section or a page that your customers you use to write a Review.

# Actions

**submitReview.ts** Action to submit your customer review about a product.
