import { AppContext } from "../mod.ts";
import { NotionPage } from "../utils/types.ts";

interface Props {
  /**
   * @title Parent Database ID
   * @description ID of the database to create the page in (leave empty if creating under a page)
   */
  parent_database_id?: string;

  /**
   * @title Parent Page ID
   * @description ID of the page to create the page under (leave empty if creating in a database)
   */
  parent_page_id?: string;

  /**
   * @title Page Title
   * @description The title of the page
   */
  title: string;

  /**
   * @title Additional Properties
   * @description Additional page properties as JSON (optional)
   * @format textarea
   */
  additional_properties?: string;

  /**
   * @title Icon Emoji
   * @description Page icon as emoji (e.g., 📝, 🚀)
   */
  icon_emoji?: string;

  /**
   * @title Cover Image URL
   * @description URL for the page cover image
   */
  cover_url?: string;
}

/**
 * @title Create Notion Page
 * @description Create a new page in Notion
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<NotionPage> => {
  // Build the parent object
  const parent: {
    database_id?: string;
    page_id?: string;
    type?: "database_id" | "page_id";
  } = {};

  if (props.parent_database_id) {
    parent.database_id = props.parent_database_id;
    parent.type = "database_id";
  } else if (props.parent_page_id) {
    parent.page_id = props.parent_page_id;
    parent.type = "page_id";
  } else {
    throw new Error(
      "Either parent_database_id or parent_page_id must be provided",
    );
  }

  // Build the properties object
  const properties: Record<string, unknown> = {};

  // Add title property
  if (props.parent_database_id) {
    // For database pages, the title property name varies, so we use a common approach
    properties.Name = {
      title: [
        {
          text: {
            content: props.title,
          },
        },
      ],
    };
  } else {
    // For regular pages
    properties.title = {
      title: [
        {
          text: {
            content: props.title,
          },
        },
      ],
    };
  }

  // Add additional properties if provided
  if (props.additional_properties) {
    try {
      const additionalProps = JSON.parse(props.additional_properties);
      Object.assign(properties, additionalProps);
    } catch (error) {
      throw new Error(
        "Invalid JSON in additional_properties: " + (error instanceof Error ? error.message : String(error)),
      );
    }
  }

  // Build the request body
  const body: {
    parent: typeof parent;
    properties: typeof properties;
    icon?: { type: "emoji"; emoji: string };
    cover?: { type: "external"; external: { url: string } };
  } = {
    parent,
    properties,
  };

  // Add icon if provided
  if (props.icon_emoji) {
    body.icon = {
      type: "emoji",
      emoji: props.icon_emoji,
    };
  }

  // Add cover if provided
  if (props.cover_url) {
    body.cover = {
      type: "external",
      external: { url: props.cover_url },
    };
  }

  const response = await ctx.api[`POST /pages`]({}, { body });

  const result = await response.json();

  return result;
};

export default action;
