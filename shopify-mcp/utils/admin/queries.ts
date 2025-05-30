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

export const GetOrderDetails = {
  fragments: [TimeLineEvent],
  query: gql`
    query GetOrders($query: String!) {
  orders(first: 1, query: $query) {
    nodes {
      id
      name
      email
      createdAt
      totalPriceSet {
        presentmentMoney {
          amount
          currencyCode
        }
      }
      paymentCollectionDetails {
        additionalPaymentCollectionUrl
      } 
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
