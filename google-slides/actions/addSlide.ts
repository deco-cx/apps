import type { AppContext } from "../mod.ts";

interface Props {
    /**
     * @title Presentation ID
     * @description The ID of the presentation to add the slide to
     */
    presentationId: string;

    /**
     * @title Layout
     * @description The predefined layout to use for the new slide
     */
    layout: "TITLE" | "MAIN" | "SECTION_HEADER" | "TITLE_AND_BODY" | "BLANK";

    /**
     * @title Insertion Index
     * @description The zero-based index where to insert the new slide (optional)
     */
    insertionIndex?: number;
}

/**
 * @title Add Slide
 * @description Adds a new slide to an existing presentation
 */
const action = async (
    props: Props,
    _req: Request,
    ctx: AppContext,
): Promise<{ presentationId: string; replies: any[] }> => {
    const response = await ctx.api["POST /v1/presentations/:presentationId/batchUpdate"]({
        presentationId: props.presentationId,
    }, {
        body: {
            requests: [
                {
                    createSlide: {
                        insertionIndex: props.insertionIndex,
                        slideLayoutReference: {
                            predefinedLayout: props.layout,
                        },
                    },
                },
            ],
        },
    });

    return response.json();
};

export default action; 