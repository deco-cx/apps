export default function Image(){

    return async (req: Request) => {
        const url = new URL(req.url);
        const lastPath = url.pathname.split("/_d/assets/")[1];
        const imageUrl = `${url.protocol}//${url.host}/live/invoke/website/loaders/image.ts?src=${lastPath}&${url.searchParams.toString()}`;
        const response = await fetch(imageUrl);
        return new Response(response.body, response);
    }
}