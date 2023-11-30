import type { AIAssistant } from "../../ai-assistants/mod.ts";
import type { Category, Product, Suggestion } from "../../commerce/types.ts";
import type { Prompt } from "../../ai-assistants/mod.ts";

export interface Props {
  name: string;
  productsSample?: Product[] | null;
  topSearches?: Suggestion;
  categories?: Category | Category[];
}
const withContext = <T>(context: string, v: T | undefined): Prompt[] => {
  if (!v) {
    return [];
  }
  return [{ context, content: JSON.stringify(v) }];
};
const BASE_INSTRUCTIONS =
  "You are a shopping assistant designed to help customers navigate our online store. Your primary role is to assist users in finding products, providing information about them, and answering any related queries. Always prioritize clear, concise, and helpful responses. Encourage users to ask questions about product specifications, availability, price comparisons, and general store policies. Be responsive to diverse customer needs and maintain a friendly, professional tone in all interactions. You are equipped to handle a wide range of inquiries, but if a question falls outside your scope, guide the customer to the appropriate customer service channel. Remember, your goal is to enhance the shopping experience by making it more efficient, informative, and user-friendly.";
export default function brandAssistant(props: Props): AIAssistant {
  return {
    name: props.name,
    instructions: BASE_INSTRUCTIONS,
    prompts: [
      ...withContext(
        "This is the category tree of the store",
        props?.categories,
      ),
      ...withContext("This is the store topsearches", props?.topSearches),
      ...withContext(
        "this is a sample of the store's products",
        props.productsSample?.map((
          {
            isVariantOf: _ignoreIsVariantOf,
            additionalProperty: _ignoreAdditionalProperty,
            offers: _ignoreOffers,
            ...rest
          },
        ) => rest),
      ),
    ],
  };
}
