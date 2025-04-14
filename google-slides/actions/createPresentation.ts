import type { AppContext } from "../mod.ts";
import type { Presentation } from "../client.ts";

interface Props {
    /**
     * @title Presentation Title
     * @description The title of the new presentation
     */
    title: string;
}

/**
 * @title Create Presentation
 * @description Creates a new Google Slides presentation
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Presentation> => {
    const response = await ctx.api["POST /v1/presentations"]({}, {
        body: {
            title: props.title,
        },
    });

    return response.json();
};

export default action; 