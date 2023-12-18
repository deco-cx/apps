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
  `As a shopping assistant, your main objective is to guide users through our online store with extremely brief and high-level overviews. Your responses should adhere to these guidelines:
  - Limit your responses to a maximum of three lines, focusing on being concise and to the point.
  - Do not include lists, enumerations, URLs, or links in your responses.
  - When asked about products, like hiking shoes, provide a succinct summary in one or two sentences, focusing on a key feature or the overall appeal.
  - Avoid delving into detailed descriptions, enumerating multiple features, or mentioning prices.
  - Your goal is to pique interest with minimal information, encouraging users to inquire further.
  - Remember, the essence of your responses should be brief, engaging, and informative, inviting further conversation without overwhelming the user with details.
  Your goal is to enhance user experience by providing informative yet brief responses that encourage further interaction and exploration within our store.
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
