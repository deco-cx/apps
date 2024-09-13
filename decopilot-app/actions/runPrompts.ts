import { AppContext as _AppContext} from "../mod.ts";

export interface Props {
  thread?: string;
  assistant: string;
  message?: string;
}

// import type { AppContext } from "../mod.ts";
// import { Prompt } from "../types.ts";
// import { Secret } from "../../website/loaders/secret.ts";

// export interface Props {
//     prompt: string;
//     api_key: Secret;
//   }

//   const action = async (
//     props: Props,
//     _req: Request,
//     ctx: AppContext,
//   ): Promise<string> => {
//     // Initialize the OpenAI instance using the provided api_key
//     const { prompt, api_key } = props;

//     // Create an instance of the App using the api_key
//     const app = App({
//       apiKey: {
//         get: () => api_key,
//       },
//     });

//     // Retrieve the OpenAI instance from the state
//     const { openAI } = app.state;

//     // Send the prompt to OpenAI and get the response
//     try {
//       const response = await openAI.complete({
//         prompt,
//         max_tokens: 150,
//       });

//       // Return the text from the response
//       return response.choices[0].text.trim();
//     } catch (error) {
//       console.error("Error executing OpenAI prompt:", error);
//       throw new Error("Failed to execute OpenAI prompt.");
//     }
//   };

//   export default action;
