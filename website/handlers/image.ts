import { PATH } from "../components/Image.tsx";

const AWS_BUCKET_URL = "https://deco-sites-assets.s3.sa-east-1.amazonaws.com";

export default function Image() {
  return async (req: Request) => {
    const url = new URL(req.url);
    const imageUrl = url.pathname.split(PATH)[1];

    if (imageUrl.startsWith("http")) {
      const loaderUrl =
        `${url.protocol}//${url.host}/live/invoke/website/loaders/image.ts?src=${imageUrl}&${url.searchParams.toString()}`;
      const response = await fetch(loaderUrl);
      return new Response(response.body, response);
    }
    const response = await fetch(`${AWS_BUCKET_URL}/${imageUrl}`);
    return new Response(response.body, response);
  };
}
