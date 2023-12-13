import type { ManifestOf } from "deco/mod.ts";
import type { AIAssistant, Prompt } from "../../ai-assistants/mod.ts";
import type { Category, Product, Suggestion } from "../../commerce/types.ts";
import type { Manifest as OpenAIManifest } from "../../openai/manifest.gen.ts";
import type vtex from "../../vtex/mod.ts";
export interface Props {
  name: string;
  productsSample?: Product[] | null;
  topSearches?: Suggestion;
  categories?: Category | Category[];
  instructions?: string;
  welcomeMessage?: string;
}
const withContext = <T>(context: string, v: T | undefined): Prompt[] => {
  if (!v) {
    return [];
  }
  return [{ context, content: JSON.stringify(v) }];
};
type VTEXManifest = ManifestOf<ReturnType<typeof vtex>>;
const BASE_INSTRUCTIONS =
  `You are a shopping assistant designed to help customers navigate our online store.
  Your primary role is to assist users in finding products, providing information about them, and answering any related queries.
  Always prioritize clear, concise, and helpful responses.
  Encourage users to ask questions about product specifications, availability, price comparisons, and general store policies.
  Be responsive to diverse customer needs and maintain a friendly, professional tone in all interactions.
  You are equipped to handle a wide range of inquiries, but if a question falls outside your scope, guide the customer to the appropriate customer service channel.
  Remember, your goal is to enhance the shopping experience by making it more efficient, informative, and user-friendly.
  Always try to provide a search query based on what the user asked, if you can't, ask for more information.
  `;
export default function brandAssistant(props: Props): AIAssistant {
  const assistant: AIAssistant<VTEXManifest & OpenAIManifest> = {
    useProps: (props: unknown) => {
      if (!props) {
        return props;
      }
      if (typeof props !== "object") {
        return props;
      }
      if (!("props" in props)) {
        return props;
      }
      return {
        props: {
          count: 10,
          query: "",
          ...typeof props.props === "object" ? props.props : {},
        },
      };
    },
    availableFunctions: ["vtex/loaders/intelligentSearch/productList.ts"],
    name: props.name,
    welcomeMessage: props?.welcomeMessage ??
      `👋 Welcome to our Online Store Assistant! How can I assist you today? Whether you're looking for product information, pricing details, or help with navigating our store, feel free to ask. I'm here to make your shopping experience smooth and enjoyable! Just type your question, and let's get started. 🛍️`,
    instructions: `${BASE_INSTRUCTIONS}. ${
      props.instructions ?? ""
    }. You should ALWAYS fulfill the query parameter even with an empty string when calling the productList.ts function, also, make sure you have information enough to make the search, otherwise ask for more information.`,
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
        ) => rest).slice(0, 1),
      ),
    ],
  };
  return assistant as AIAssistant;
}
