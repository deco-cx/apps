const AWS_BUCKET_URL = "https://deco-sites-assets.s3.sa-east-1.amazonaws.com";

export default function Image() {
  return async (req: Request) => {
    const url = new URL(req.url);
    const imageUrl = url.pathname.split("/_d/assets/")[1];

    if (imageUrl.startsWith("http")) {
      const loaderUrl =
        `${url.protocol}//${url.host}/live/invoke/website/loaders/image.ts?src=${imageUrl}&${url.searchParams.toString()}`;
      return await fetch(loaderUrl);
    }
    return await fetch(
      `${AWS_BUCKET_URL}${imageUrl}`,
    );
  };
}
