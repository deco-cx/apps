export const QUERY_KIT_ITEMS = `
query QUERY_KIT_ITEMS($identifier: ProductUniqueIdentifier) {
  product(identifier: $identifier) @context(provider: "vtex.search-graphql@0.x" ) {
    items {
      images {
        cacheId
        imageId
        imageLabel
        imageTag
        imageUrl
        imageText
      }
      variations {
        originalName
        name
      }
      kitItems {
        itemId
        amount
        sku {
          videos {
            videoUrl
          }
          kitItems {
            itemId
            amount
          }
          referenceId {
            Key
            Value
          }
          variations {
            originalName
            name
          }
          images {
            cacheId
            imageId
            imageLabel
            imageTag
            imageUrl
            imageText
          }
          itemId
          name
          nameComplete
          referenceId {
            Key
            Value
          }
          complementName
          ean
          measurementUnit
          unitMultiplier
          estimatedDateArrival
          sellers {
            sellerId
            sellerName
            addToCartLink
            sellerDefault
            commertialOffer {
              Price
              ListPrice
              spotPrice
              PriceWithoutDiscount
              RewardValue
              PriceValidUntil
              AvailableQuantity
              Tax
              taxPercentage
              CacheVersionUsedToCallCheckout
              Installments {
                Value
                InterestRate
                TotalValuePlusInterestRate
                NumberOfInstallments
                PaymentSystemName
                PaymentSystemGroupName
                Name
              }
              discountHighlights {
                name
              }
              teasers {
                name
                conditions {
                  minimumQuantity
                }
                effects {
                  parameters {
                    name
                    value
                  }
                }
                generalValues {
                  key
                  value
                }
              }
              gifts {
                productName
                skuName
                brand
                linkText
                description
              }
            }
          }
        }
      }
    }
  }
}
`;