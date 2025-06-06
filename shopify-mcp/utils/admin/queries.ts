import { gql } from "../../../utils/graphql.ts";

export const TimeLineEvent = gql`
fragment TimelineEvent on Event {
  id
  createdAt
  criticalAlert
  message
  ... on BasicEvent {
    id
    action
    attributeToApp
    attributeToUser
    additionalContent
  }
  
}
`;

export const OrderLineItems = gql`
fragment OrderLineItems on Order {
  lineItems(first: 100) {
    edges {
      node {
        id
        title
        quantity
        sku
        variantTitle
        discountedUnitPriceAfterAllDiscountsSet {
            presentmentMoney {
              amount
              currencyCode
            }
            shopMoney {
              amount
              currencyCode
            }
          }
      }
    }
  }
}
`;

export const GetOrderDetails = {
  fragments: [TimeLineEvent, OrderLineItems],
  query: gql`
    query GetOrders($query: String!) {
  orders(first: 1, query: $query) {
    nodes {
      id
      name
      email
      createdAt
      displayFinancialStatus
      customer {
        firstName
        lastName
      }
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      paymentCollectionDetails {
        additionalPaymentCollectionUrl
      } 
      ... OrderLineItems
      events(first: 100) {
        edges {
          cursor
          node {
            ...TimelineEvent
          }
        }
      }
    }
  }
}
    `,
};
