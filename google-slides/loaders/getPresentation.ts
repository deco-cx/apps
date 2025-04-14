import type { AppContext } from "../mod.ts";
import type { Presentation } from "../client.ts";

interface Props {
    /**
     * @title Presentation ID
     * @description The ID of the presentation to retrieve
     */
    presentationId: string;
}

/**
 * @title Get Presentation
 * @description Retrieves a Google Slides presentation by ID
 */
const loader = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<Presentation> => {
    const response = await ctx.api["GET /v1/presentations/:presentationId"]({
        presentationId: props.presentationId,
    });

    return response.json();
};

export default loader; 