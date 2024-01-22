import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

export interface DescribeImageProps {
  uploadURL: string;
  userPrompt: string;
}

export default async function describeImage(
  describeImageProps: DescribeImageProps,
) {
  console.log("describe image props: ", describeImageProps)
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Describe this image in few words focus on it's main characteristics. Use the same language as the user prompt.
                              This description will be used to search similar items in an e-commerce store, 
                              so describe name of the product and other relevant information. Use NO MORE than 3 words to describe the product.
                               Avoid using colors. Also, take into consideration the user prompt and describe the object it 
                               focuses on if there is one. Output should be 1-2 sentences and should be a request summarizing 
                               the user's need/request to a sales assistant that will search the product in an e-commerce store.
  
                               User prompt:
                              ${describeImageProps.userPrompt}`,
            },
            {
              type: "image_url",
              image_url: {
                "url": describeImageProps.uploadURL,
              },
            },
          ],
        },
      ],
    });
    console.log("describe image response: ", response);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: error.error.message }), {
      status: error.status,
      headers: error.headers,
    });
  }
}
