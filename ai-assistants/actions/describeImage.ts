import OpenAI from "https://deno.land/x/openai@v4.24.1/mod.ts";

const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") || "" });

export default async function describeImage() {
    const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text:
                            "Describe this image in few words focus on it's main characteristics. This description will be used to search similar items in an e-commerce store, so describe color, name of the product and other relevant information. Use 3 words tops to describe.",
                    },
                    {
                        type: "image_url",
                        image_url: {
                            "url":
                                "https://alssports.vtexassets.com/arquivos/ids/1352133-800-auto?v=638228706179000000&width=800&height=auto&aspect=true",
                        },
                    },
                ],
            },
        ],
    });
    return response;
}
